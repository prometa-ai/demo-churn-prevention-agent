'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Avatar,
  IconButton,
  Divider,
  useToast,
  Spinner,
  Badge,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tooltip,
} from '@chakra-ui/react';
import { ArrowForwardIcon, PhoneIcon, InfoIcon } from '@chakra-ui/icons';
import { FaMicrophone, FaStop, FaVolumeMute } from 'react-icons/fa';
import { Customer } from '../models/Customer';

// Define SpeechRecognition type - needed for TypeScript
interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  agentType?: 'orchestrator' | 'outreach' | 'personalization' | 'rag';
}

interface ChatInterfaceProps {
  customer: Customer;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ customer }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Audio analysis refs for silence detection
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceThreshold = useRef<number>(0.01); // Threshold for what counts as silence
  const silenceDurationMs = 2000; // Duration of silence in ms before stopping (2 seconds)
  const isProcessingSpeechRef = useRef<boolean>(false);

  // Defining a type for conversation context to track topics
  type ConversationContext = {
    currentTopic: 'data_package' | 'premium_package' | 'payment' | 'campaigns' | 'customer_service' | 'general';
    initialOffer: string;
    customerResponseCount: number;
  };

  // Initialize state for conversation context
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    currentTopic: 'general',
    initialOffer: '',
    customerResponseCount: 0
  });

  // Create audio element for TTS playback
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      // Configure recognition
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'tr-TR'; // Set Turkish language
      
      // Setup handlers
      recognition.onstart = () => {
        setIsListening(true);
        startRecordingTimer();
        onOpen(); // Open the recording modal
        
        // Set up microphone for silence detection
        setupSilenceDetection();
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          // Note: We're not automatically stopping/sending here anymore
          // That's handled by the silence detection
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          setRecordingSeconds(0);
        }
        onClose(); // Close the recording modal
        
        // Clean up silence detection
        cleanupSilenceDetection();
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          setRecordingSeconds(0);
        }
        
        toast({
          title: 'Hata',
          description: 'Konuşma tanıma hatası: ' + event.error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        
        onClose(); // Close the recording modal
        
        // Clean up silence detection
        cleanupSilenceDetection();
      };
      
      speechRecognitionRef.current = recognition;
    } else {
      toast({
        title: 'Uyarı',
        description: 'Tarayıcınız konuşma tanıma özelliğini desteklemiyor.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
    
    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      cleanupSilenceDetection();
    };
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with a welcome message
  useEffect(() => {
    // Fetch the initial message from GPT-4o via API
    const fetchInitialMessage = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/initialMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer,
          }),
        });
        
        if (!response.ok) {
          throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        // Set the conversation context
        setConversationContext({
          currentTopic: data.topic,
          initialOffer: data.initialMessage,
          customerResponseCount: 0
        });
        
        // Add the initial message to the chat
        const initialMessageObj: ChatMessage = {
          id: Date.now().toString(),
          sender: 'ai',
          text: data.initialMessage,
          timestamp: new Date(),
          agentType: 'personalization'
        };
        
        setMessages([initialMessageObj]);
        
        // Removed automatic text-to-speech for initial message
        // handleTextToSpeech(data.initialMessage);
      } catch (error) {
        console.error('Error fetching initial message:', error);
        
        // Fallback to local generation if API fails
        const initialMessage = generateProactiveInitialMessage(customer);
        
        // Determine the initial topic based on the message content
        let initialTopic: ConversationContext['currentTopic'] = 'general';
        
        if (initialMessage.toLowerCase().includes('veri kullanımınızın limitinize yaklaştığını')) {
          initialTopic = 'data_package';
        } else if (initialMessage.toLowerCase().includes('premium paket')) {
          initialTopic = 'premium_package';
        } else if (initialMessage.toLowerCase().includes('fatura') || initialMessage.toLowerCase().includes('ödeme')) {
          initialTopic = 'payment';
        } else if (initialMessage.toLowerCase().includes('kampanya') || initialMessage.includes('hizmet')) {
          initialTopic = 'campaigns';
        }
        
        // Set the initial conversation context
        setConversationContext({
          currentTopic: initialTopic,
          initialOffer: initialMessage,
          customerResponseCount: 0
        });
        
        // Add the initial message to the chat
        const initialMessageObj: ChatMessage = {
          id: Date.now().toString(),
          sender: 'ai',
          text: initialMessage,
          timestamp: new Date(),
          agentType: 'personalization'
        };
        
        setMessages([initialMessageObj]);
        
        // Removed automatic text-to-speech for initial message
        // handleTextToSpeech(initialMessage);
        
        toast({
          title: 'Bilgi',
          description: 'GPT tabanlı kişiselleştirilmiş mesaj oluşturulamadı. Yerel yanıt kullanılıyor.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialMessage();
  }, [customer.id]); // Use customer.id instead of customer.name to prevent unnecessary re-renders

  // Stop recording when component unmounts
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      stopSpeechRecognition();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Setup silence detection with Web Audio API
  const setupSilenceDetection = async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;
      
      // Create audio context and analyzer
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      // Connect the microphone stream to the analyzer
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Configure analyzer settings
      analyserRef.current.fftSize = 1024;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Set up periodic analysis to detect silence
      const checkSilence = () => {
        if (!analyserRef.current || !isListening) return;
        
        // Get audio levels
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume level
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength / 255; // Normalize to 0-1
        
        // If audio level is below threshold, start silence timer
        if (average < silenceThreshold.current) {
          if (!silenceTimerRef.current) {
            console.log("Silence detected, starting silence timer");
            silenceTimerRef.current = setTimeout(() => {
              console.log('Silence detected for 2 seconds, stopping recording');
              // Store input message content before stopping recognition to avoid race condition
              const currentInputMessage = inputMessage;
              
              // Only proceed if we're still listening and not already processing
              if (isListening && !isProcessingSpeechRef.current) {
                isProcessingSpeechRef.current = true;
                
                // Stop the speech recognition
                stopSpeechRecognition();
                
                // Wait a brief moment to let final transcript appear
                setTimeout(() => {
                  // If we have content (either from before or from final transcript), send it
                  if (inputMessage.trim() || currentInputMessage.trim()) {
                    handleSendMessage();
                  }
                  isProcessingSpeechRef.current = false;
                }, 800);
              }
            }, silenceDurationMs);
          }
        } else {
          // Reset the silence timer if audio level is above threshold
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }
        
        // Schedule next check if still listening
        if (isListening) {
          requestAnimationFrame(checkSilence);
        }
      };
      
      // Start silence detection
      checkSilence();
    } catch (error) {
      console.error('Error setting up silence detection:', error);
    }
  };

  // Clean up silence detection resources
  const cleanupSilenceDetection = () => {
    // Clear the silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    // Stop and disconnect the analyzer
    if (analyserRef.current) {
      analyserRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
      audioContextRef.current = null;
    }
    
    // Stop all microphone tracks
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }
  };

  // Start recording timer
  const startRecordingTimer = () => {
    let seconds = 0;
    recordingTimerRef.current = setInterval(() => {
      seconds += 1;
      setRecordingSeconds(seconds);
      
      // Auto-stop recording after 30 seconds for safety
      if (seconds >= 30) {
        stopSpeechRecognition();
      }
    }, 1000);
  };

  const handleSendMessage = async () => {
    // First capture the current input message to use throughout this function
    const messageToSend = inputMessage.trim();
    
    if (!messageToSend) return; // Don't send empty messages
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Update the conversation context to track customer responses
    setConversationContext(prevContext => ({
      ...prevContext,
      customerResponseCount: prevContext.customerResponseCount + 1
    }));
    
    try {
      // Prepare context for GPT-4o
      const gpt4oContext = prepareGPT4OContext(customer, [...messages, userMessage]);
      
      // Determine which agent type to use based on the message content
      const agentType = determineAgentType(messageToSend);
      
      // Call the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          customer,
          agentType,
          conversationContext,
          gpt4oContext, // Pass the GPT-4o context to the API
        }),
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      // Create AI response message
      const aiResponse: ChatMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        text: data.response || generateMockAIResponse(messageToSend, customer).text,
        timestamp: new Date(),
        agentType,
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      
      // Convert the AI response to speech
      handleTextToSpeech(aiResponse.text);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback to mock response in case of error
      const aiResponse = generateMockAIResponse(messageToSend, customer);
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      
      // Convert the mock response to speech
      handleTextToSpeech(aiResponse.text);
      
      toast({
        title: 'Hata',
        description: 'Mesaj gönderilemedi. Yerel yanıt kullanılıyor.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  // Function to stop TTS playback
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  // Function to convert text to speech using OpenAI's TTS API
  const handleTextToSpeech = async (text: string) => {
    if (!text || !audioRef.current) return;
    
    try {
      setIsSpeaking(true);
      
      // Call the text-to-speech API
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          action: 'text-to-speech',
        }),
      });
      
      if (!response.ok) {
        throw new Error('TTS API request failed');
      }
      
      // Get the audio data as a blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onplay = () => setIsSpeaking(true);
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audioRef.current.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          toast({
            title: 'Hata',
            description: 'Ses oynatılamadı',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        };
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsSpeaking(false);
      toast({
        title: 'Hata',
        description: 'Metin sese dönüştürülemedi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Function to start speech recognition
  const startSpeechRecognition = () => {
    if (!speechRecognitionRef.current) {
      toast({
        title: 'Uyarı',
        description: 'Tarayıcınız konuşma tanıma özelliğini desteklemiyor.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      speechRecognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast({
        title: 'Hata',
        description: 'Konuşma tanıma başlatılamadı',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Function to stop speech recognition
  const stopSpeechRecognition = () => {
    if (speechRecognitionRef.current && isListening) {
      try {
        speechRecognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  };

  // Function to toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  // Function to translate agent type
  const translateAgentType = (agentType?: string): string => {
    switch (agentType) {
      case 'orchestrator': return 'Orkestrasyon';
      case 'outreach': return 'İletişim';
      case 'personalization': return 'Kişiselleştirme';
      case 'rag': return 'Bilgi';
      default: return agentType || '';
    }
  };

  // Function to generate a personalized initial message based on customer data
  const generateProactiveInitialMessage = (customer: Customer): string => {
    // Calculate customer tenure in years
    const customerSinceDate = new Date(customer.customerSince);
    const currentDate = new Date();
    const tenureYears = currentDate.getFullYear() - customerSinceDate.getFullYear();
    
    // Calculate data usage percentage
    const dataUsagePercent = (customer.usage.dataUsage.current / customer.usage.dataUsage.limit) * 100;
    const callUsagePercent = (customer.usage.callUsage.current / customer.usage.callUsage.limit) * 100;
    
    // Calculate bill increase rate if available, otherwise calculate from payment history
    const billIncreaseRate = (customer as any).billIncreaseRate !== undefined ? 
      (customer as any).billIncreaseRate : 
      customer.billing.paymentHistory.length > 1 ? 
        ((customer.billing.currentBill - customer.billing.paymentHistory[1].amount) / customer.billing.paymentHistory[1].amount) * 100 : 
        0;
    
    // Count unresolved tickets and support issues
    const unresolvedTickets = customer.customerService.ticketHistory.filter(t => t.status === 'open' || t.status === 'pending').length;
    const pendingTickets = customer.customerService.ticketHistory.filter(t => t.status === 'pending').length;
    const hasHighTicketCount = customer.customerService.ticketsOpened > 3;
    const hasLowSatisfaction = customer.customerService.averageSatisfaction < 3.5;
    const hasSupportIssues = hasHighTicketCount || hasLowSatisfaction || unresolvedTickets > 0 || pendingTickets > 0;
    
    // Standard introduction that includes company, role, name and purpose
    let message = `Merhaba ${customer.name}, ben Prometa, Vodafone Müşteri Hizmetlerinden yapay zeka tabanlı müşteri temsilciniz. `;
    
    // Determine the most important issue to address
    // Priority 1: High bill increase rate
    if (billIncreaseRate > 20) {
      message += `Son dönemde fatura tutarınızda %${Math.round(billIncreaseRate)} oranında bir artış olduğunu fark ettim. Size daha uygun ve ihtiyaçlarınıza yönelik bir paket önerebilirim, böylece fatura tutarınızda tasarruf sağlayabilirsiniz. Bu konuda bilgi almak ister misiniz?`;
      setConversationContext(prevContext => ({
        ...prevContext,
        currentTopic: 'payment'
      }));
    }
    // Priority 2: Support issues
    else if (hasSupportIssues) {
      message += `Hizmet deneyiminizi iyileştirmek için size özel müşteri temsilcisi atayabiliriz. Bu sayede tüm sorularınız öncelikli olarak yanıtlanacak ve ihtiyaçlarınıza daha hızlı çözüm sunulacaktır. Bu hizmetten yararlanmak ister misiniz?`;
      setConversationContext(prevContext => ({
        ...prevContext,
        currentTopic: 'customer_service'
      }));
    }
    // Priority 3: High data usage
    else if (dataUsagePercent > 80) {
      message += `Veri kullanımınızın (%${Math.round(dataUsagePercent)}) limitinize yaklaştığını görüyorum. Size ${Math.round(customer.usage.dataUsage.limit * 1.5)}GB veri limitli bir paket önerebilirim. Bu konuda detaylı bilgi almak ister misiniz?`;
      setConversationContext(prevContext => ({
        ...prevContext,
        currentTopic: 'data_package'
      }));
    }
    // Priority 4: High call usage
    else if (callUsagePercent > 90) {
      message += `Konuşma sürenizin (%${Math.round(callUsagePercent)}) limitinize yaklaştığını görüyorum. Size sınırsız konuşma içeren bir paket önerebilirim. Bu konuda detaylı bilgi almak ister misiniz?`;
      setConversationContext(prevContext => ({
        ...prevContext,
        currentTopic: 'data_package'
      }));
    }
    // Priority 5: Overdue payment
    else if (customer.billing.paymentStatus === 'overdue') {
      const daysPastDue = Math.floor((new Date().getTime() - new Date(customer.billing.dueDate).getTime()) / (1000 * 3600 * 24));
      message += `Son faturanız için ${daysPastDue} gündür ödeme beklemesi olduğunu görüyorum. Size özel ödeme seçenekleri sunabilirim. Ödeme konusunda yardımcı olmamı ister misiniz?`;
      setConversationContext(prevContext => ({
        ...prevContext,
        currentTopic: 'payment'
      }));
    }
    // Priority 6: Long-term customer
    else if (tenureYears >= 2) {
      message += `${tenureYears} yıldır değerli müşterimiz olduğunuz için sadakat programımız kapsamında size özel avantajlar sunabiliriz. Bu programdaki ayrıcalıklar hakkında bilgi almak ister misiniz?`;
      setConversationContext(prevContext => ({
        ...prevContext,
        currentTopic: 'campaigns'
      }));
    }
    // Default case: General usage pattern or campaign
    else {
      // Default message focused on their usage pattern
      if (dataUsagePercent > 60) {
        message += `Kullanım analizinize göre veri tüketiminizin yüksek olduğunu görüyorum. Size özel "Veri Aşım Koruması" hizmetimiz hakkında bilgi vermek isterim. Bu konuda detaylı bilgi almak ister misiniz?`;
        setConversationContext(prevContext => ({
          ...prevContext,
          currentTopic: 'data_package'
        }));
      } else {
        message += `Kullanım alışkanlıklarınıza uygun olabilecek yeni kampanyalarımız hakkında bilgi vermek istiyorum. Detaylı bilgi almak ister misiniz?`;
        setConversationContext(prevContext => ({
          ...prevContext,
          currentTopic: 'campaigns'
        }));
      }
    }
    
    return message;
  };

  // Function to prepare context for GPT-4o to manage dialog flow
  const prepareGPT4OContext = (customer: Customer, messageHistory: ChatMessage[]): string => {
    // Calculate support-related factors
    const unresolvedTickets = customer.customerService.ticketHistory.filter(t => t.status === 'open' || t.status === 'pending').length;
    const pendingTickets = customer.customerService.ticketHistory.filter(t => t.status === 'pending').length;
    const recentTickets = customer.customerService.ticketHistory.filter(t => {
      const ticketDate = new Date(t.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return ticketDate >= threeMonthsAgo;
    }).length;
    
    // Calculate data usage percentage
    const dataUsagePercent = (customer.usage.dataUsage.current / customer.usage.dataUsage.limit) * 100;
    
    // Calculate bill increase rate if available
    const billIncreaseRate = (customer as any).billIncreaseRate !== undefined ? 
      (customer as any).billIncreaseRate : 
      customer.billing.paymentHistory.length > 1 ? 
        ((customer.billing.currentBill - customer.billing.paymentHistory[1].amount) / customer.billing.paymentHistory[1].amount) * 100 : 
        0;
    
    // Check for support issues
    const hasHighTicketCount = customer.customerService.ticketsOpened > 3;
    const hasLowSatisfaction = customer.customerService.averageSatisfaction < 3.5;
    const hasSupportIssues = hasHighTicketCount || hasLowSatisfaction || unresolvedTickets > 0 || pendingTickets > 0;
    
    // Check for high data usage
    const hasHighDataUsage = dataUsagePercent > 80;
    
    // Check for high bill increase
    const hasHighBillIncrease = billIncreaseRate > 20;
    
    // Calculate customer tenure in years
    const customerSinceDate = new Date(customer.customerSince);
    const currentDate = new Date();
    const tenureYears = currentDate.getFullYear() - customerSinceDate.getFullYear();
    
    // Build the appropriate context template
    return `
USER DETAILS:
- Name: ${customer.name}
- Customer since: ${customer.customerSince} (${tenureYears} years)
- Current plan: ${customer.plan.name} (${customer.plan.monthlyCost.toFixed(2)}₺/month)
- Data usage: ${customer.usage.dataUsage.current}GB/${customer.usage.dataUsage.limit}GB (${Math.round(dataUsagePercent)}%)
- Call usage: ${customer.usage.callUsage.current} mins/${customer.usage.callUsage.limit} mins (${Math.round((customer.usage.callUsage.current / customer.usage.callUsage.limit) * 100)}%)
- Payment status: ${customer.billing.paymentStatus}
- Churn probability: ${(customer.churnProbability * 100).toFixed()}%
- Bill increase rate: ${billIncreaseRate.toFixed(1)}%

KEY CUSTOMER METRICS:
${hasHighBillIncrease ? `- HIGH BILL INCREASE: The customer's bill has increased by ${billIncreaseRate.toFixed(1)}% compared to previous month` : '- Bill increase rate: Normal'}
${hasHighDataUsage ? `- HIGH DATA USAGE: The customer is using ${Math.round(dataUsagePercent)}% of their data limit` : '- Data usage: Normal'}
${hasSupportIssues ? `- SUPPORT ISSUES: ${unresolvedTickets} unresolved tickets, ${pendingTickets} pending tickets, satisfaction rating: ${customer.customerService.averageSatisfaction.toFixed(1)}/5` : '- Support status: Normal'}

SUPPORT HISTORY DETAILS:
- Total support tickets: ${customer.customerService.ticketsOpened}
- Last contact date: ${customer.customerService.lastContact}
- Average satisfaction rating: ${customer.customerService.averageSatisfaction.toFixed(1)}/5
- Unresolved tickets: ${unresolvedTickets}
- Pending tickets: ${pendingTickets}
- Recent tickets (last 3 months): ${recentTickets}

CONVERSATION CONTEXT:
- Current topic: ${conversationContext.currentTopic}
- Customer response count: ${conversationContext.customerResponseCount}

INTERACTION GUIDELINES:
1. Be friendly, helpful, and solution-oriented.
2. Focus on providing accurate information and clear explanations.
3. Use natural, conversational Turkish language.
4. Avoid technical jargon unless the customer uses it first.
5. Keep responses concise and to the point.
6. Always offer specific solutions rather than general advice.
7. Use positive language and avoid negative phrasing.
8. Never mention churn risk, high risk, or other technical evaluation terms.

RESPONSE STRATEGY:
${hasHighBillIncrease ? 
`This customer has experienced a significant bill increase. Focus on offering solutions to reduce their bill:
- Suggest more suitable packages that align with their usage patterns
- Highlight any loyalty discounts that could be applied
- Explain options for removing unnecessary services they may not be using
- Offer installment payment options if they have overdue bills` : ''}

${hasSupportIssues ? 
`This customer has support-related issues. Focus on improving their experience:
- Acknowledge their support history without highlighting specific negative metrics
- Offer dedicated customer service representative assistance
- Provide expedited solutions to any pending or unresolved issues
- Reassure them that their concerns are important and will be addressed` : ''}

${hasHighDataUsage ? 
`This customer has high data usage. Focus on data-related solutions:
- Suggest an upgrade to a higher data package
- Offer temporary data boosters
- Explain data-saving features and tips
- Present special promotions for data-heavy users` : ''}

MESSAGE HISTORY:
${messageHistory.map(msg => `[${msg.sender.toUpperCase()}${msg.agentType ? ' - ' + msg.agentType : ''}]: ${msg.text}`).join('\n')}

TASK:
Analyze the customer data and conversation history, then respond appropriately to the customer's latest message. Focus on providing helpful, personalized service that addresses their specific needs.`;
  };

  // Mock function to generate AI responses based on conversation context
  const generateMockAIResponse = (userMessage: string, customer: Customer): ChatMessage => {
    const lowerCaseMessage = userMessage.toLowerCase();
    let responseText = '';
    let agentType: 'orchestrator' | 'outreach' | 'personalization' | 'rag' = 'orchestrator';
    
    // Check if the user's message contains positive or negative responses
    const positiveResponses = ['evet', 'olur', 'tabii', 'tabi', 'isterim', 'detay', 'bilgi', 'anlat', 'dinliyorum'];
    const negativeResponses = ['hayır', 'hayir', 'istemiyorum', 'gerek yok', 'ilgilenmiyorum', 'sonra', 'teşekkürler'];
    
    const isPositiveResponse = positiveResponses.some(response => lowerCaseMessage.includes(response));
    const isNegativeResponse = negativeResponses.some(response => lowerCaseMessage.includes(response));
    
    // If customer declines the offer, thank them and end the conversation
    if (isNegativeResponse && !lowerCaseMessage.includes('fatura') && !lowerCaseMessage.includes('paket') && 
        !lowerCaseMessage.includes('veri') && !lowerCaseMessage.includes('internet')) {
      responseText = `Anlaşıldı. Zamanınızı ayırdığınız için teşekkür ederim. Başka bir konuda yardımcı olabileceğim bir şey olursa, lütfen bana ulaşmaktan çekinmeyin.`;
      return {
        id: Date.now().toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date(),
        agentType: conversationContext.currentTopic === 'payment' ? 'rag' : 
                  (conversationContext.currentTopic === 'customer_service' ? 'outreach' : 'orchestrator')
      };
    }
    
    // Support terms for detecting support-related queries
    const supportTerms = [
      'destek', 'talep', 'sorun', 'problem', 'çözüm', 'şikayet', 'yardım', 'memnuniyet',
      'bekleyen', 'açık', 'çözülmemiş', 'beklemede', 'müşteri temsilcisi', 'müşteri hizmetleri'
    ];
    
    const hasSupportTerm = supportTerms.some(term => lowerCaseMessage.includes(term));
    
    // Special handling for high churn risk customers with support issues - only one topic
    if (customer.churnProbability > 0.6 && (hasSupportTerm || conversationContext.currentTopic === 'customer_service')) {
      if (isPositiveResponse) {
        responseText = `Sizin için hemen özel bir müşteri temsilcisi atayacağım. Bu temsilci, tüm sorularınıza ve sorunlarınıza öncelikli olarak yardımcı olacak. Temsilcinizin iletişim bilgilerini şimdi mesaj olarak gönderiyorum. İsterseniz şu an yaşadığınız herhangi bir sorunu benimle paylaşabilirsiniz, hemen yardımcı olmaya çalışacağım.`;
      } else {
        responseText = `Müşteri deneyiminizi iyileştirmek için size nasıl yardımcı olabilirim? Açık destek talepleriniz veya çözülmemiş sorunlarınız varsa öncelikli olarak bunları ele alabiliriz.`;
      }
      return {
        id: Date.now().toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date(),
        agentType: 'outreach'
      };
    }
    
    // Generate topic-specific responses based on the current conversation topic
    switch (conversationContext.currentTopic) {
      case 'data_package':
        if (isPositiveResponse) {
          const dataUsagePercent = (customer.usage.dataUsage.current / customer.usage.dataUsage.limit) * 100;
          responseText = `Veri kullanımınız için size iki seçenek sunabilirim: 1) Mevcut paketinize ek olarak 5GB veri paketi ekleyebiliriz ve bu ek paket sadece ${(customer.plan.monthlyCost * 0.2).toFixed(2)}₺. 2) Bir üst pakete geçiş yapabilirsiniz, bu durumda veri limitiniz iki katına çıkar ve ilk 3 ay için %15 indirim uygulayabiliriz. Hangi seçenek sizin için daha uygun olur?`;
        } else {
          responseText = `Veri kullanımınızla ilgili başka bir konuda yardımcı olabilir miyim? Şu anki kullanımınız ${customer.usage.dataUsage.current}GB/${customer.usage.dataUsage.limit}GB olarak görünüyor.`;
        }
        agentType = 'personalization';
        break;
        
      case 'payment':
        if (isPositiveResponse) {
          responseText = `Faturanız için birkaç ödeme seçeneği sunabilirim. Kredi kartı ile hemen ödeme yapabilir, otomatik ödeme talimatı verebilir veya en yakın Vodafone bayisinden nakit ödeme yapabilirsiniz. Otomatik ödeme talimatı verirseniz, gelecekteki faturalarınızda %5 indirim sağlayabiliriz. Hangi ödeme yöntemini tercih edersiniz?`;
        } else {
          responseText = `Faturanızla ilgili başka bir konuda yardımcı olabilir miyim? Mevcut faturanız ${customer.billing.currentBill.toFixed(2)}₺ ve son ödeme tarihi ${customer.billing.dueDate}.`;
        }
        agentType = 'rag';
        break;
      
      case 'customer_service':
        if (isPositiveResponse) {
          responseText = `Müşteri deneyiminizi iyileştirmek için öncelikle açık destek taleplerinizi çözüme kavuşturacağız. Size özel bir müşteri temsilcisi atadım, kendisi sizinle en kısa sürede iletişime geçecektir. Ayrıca, bir sonraki faturanızda %10 indirim tanımladık. Başka bir konuda yardımcı olabilir miyim?`;
        } else {
          responseText = `Müşteri deneyiminizle ilgili herhangi bir sorunuz veya öneriniz var mı? Size en iyi hizmeti sunmak için buradayım.`;
        }
        agentType = 'outreach';
        break;
        
      case 'campaigns':
        if (isPositiveResponse) {
          responseText = `Size özel sadakat kampanyamız kapsamında, bir sonraki faturanızda %15 indirim ve 10GB ekstra internet hediyesi tanımladık. Bu ayrıcalıklar otomatik olarak hesabınıza yansıtılacaktır. Kampanya hakkında başka bir detay merak ettiğiniz bir şey var mı?`;
        } else {
          responseText = `Sadakat kampanyalarımız hakkında başka bir bilgi almak ister misiniz? Size özel fırsatlardan yararlanmanız bizim için önemli.`;
        }
        agentType = 'personalization';
        break;
        
      default:
        if (hasSupportTerm) {
          responseText = `Destek ihtiyaçlarınız için size özel bir müşteri temsilcisi atayabiliriz. Bu sayede tüm sorularınız ve sorunlarınız öncelikli olarak çözüme kavuşturulacaktır. Size nasıl yardımcı olabilirim?`;
          agentType = 'outreach';
        } else if (lowerCaseMessage.includes('fatura') || lowerCaseMessage.includes('ödeme')) {
          responseText = `Faturanız ${customer.billing.currentBill.toFixed(2)}₺ tutarında ve son ödeme tarihi ${customer.billing.dueDate}. Size ödeme seçenekleri veya indirim fırsatları hakkında bilgi verebilirim. Detaylı bilgi almak ister misiniz?`;
          agentType = 'rag';
        } else if (lowerCaseMessage.includes('veri') || lowerCaseMessage.includes('internet')) {
          responseText = `Veri kullanımınız ${customer.usage.dataUsage.current}GB/${customer.usage.dataUsage.limit}GB olarak görünüyor (%${Math.round((customer.usage.dataUsage.current / customer.usage.dataUsage.limit) * 100)}). Size daha uygun veri paketlerimiz hakkında bilgi vermemi ister misiniz?`;
          agentType = 'personalization';
        } else {
          responseText = `Size nasıl yardımcı olabilirim? Fatura, paket, kampanya veya destek konularında bilgi almak isterseniz sorabilirsiniz.`;
          agentType = 'orchestrator';
        }
    }
    
    return {
      id: Date.now().toString(),
      sender: 'ai',
      text: responseText,
      timestamp: new Date(),
      agentType
    };
  };

  // Get agent badge color based on agent type
  const getAgentBadgeColor = (agentType?: string) => {
    switch (agentType) {
      case 'orchestrator': return 'purple';
      case 'outreach': return 'blue';
      case 'personalization': return 'green';
      case 'rag': return 'orange';
      default: return 'gray';
    }
  };

  // Function to determine which agent type to use based on the message content
  const determineAgentType = (message: string): 'orchestrator' | 'outreach' | 'personalization' | 'rag' => {
    const lowerCaseMessage = message.toLowerCase();
    
    // Comprehensive list of support-related terms
    const supportTerms = [
      'destek', 'talep', 'sorun', 'problem', 'çözüm', 'şikayet', 'yardım', 'memnuniyet',
      'bekleyen', 'açık', 'çözülmemiş', 'beklemede', 'müşteri temsilcisi', 'müşteri hizmetleri',
      'kötü deneyim', 'olumsuz', 'deneyim', 'çalışmıyor', 'arıza', 'hata'
    ];
    
    // Check for any support-related terms - prioritize this check
    const hasSupportTerm = supportTerms.some(term => lowerCaseMessage.includes(term));
    
    if (hasSupportTerm) {
      // For support-related queries, always use outreach agent
      return 'outreach';
    }
    
    // Check for positive response to a customer service topic
    if (conversationContext.currentTopic === 'customer_service' && 
        (lowerCaseMessage.includes('evet') || lowerCaseMessage.includes('tamam') || 
         lowerCaseMessage.includes('olur') || lowerCaseMessage.includes('isterim'))) {
      return 'outreach';
    }
    
    // Check for campaign or product-related queries
    if (lowerCaseMessage.includes('kampanya') || 
        lowerCaseMessage.includes('tarife') || 
        lowerCaseMessage.includes('paket') || 
        lowerCaseMessage.includes('teklif') || 
        lowerCaseMessage.includes('fırsat')) {
      return 'rag';
    }
    
    // Check for billing or payment related queries
    if (lowerCaseMessage.includes('fatura') || 
        lowerCaseMessage.includes('ödeme') || 
        lowerCaseMessage.includes('borç') || 
        lowerCaseMessage.includes('hesap')) {
      return 'rag';
    }
    
    // Check for usage related queries
    if (lowerCaseMessage.includes('kullanım') || 
        lowerCaseMessage.includes('veri') || 
        lowerCaseMessage.includes('internet') || 
        lowerCaseMessage.includes('dakika') || 
        lowerCaseMessage.includes('mesaj')) {
      return 'personalization';
    }
    
    // Default to orchestrator for general queries
    return 'orchestrator';
  };

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      height="70vh" 
      display="flex" 
      flexDirection="column"
      boxShadow="sm"
    >
      {/* Chat header */}
      <Flex 
        p={4} 
        bg="prometa.600" 
        color="white" 
        alignItems="center" 
        justifyContent="space-between"
      >
        <HStack>
          <Avatar size="sm" name="AI Assistant" bg="white" color="prometa.600" />
          <Box>
            <Text fontWeight="bold">Yapay Zeka Müşteri Hizmetleri</Text>
            <Text fontSize="xs">Prometa.ai tarafından desteklenmiştir</Text>
          </Box>
        </HStack>
        <HStack>
          {isSpeaking && (
            <>
              <Badge colorScheme="prometaOrange" variant="solid">
                Konuşuyor
              </Badge>
              <Tooltip label="Konuşmayı durdur" placement="bottom">
                <IconButton
                  aria-label="Konuşmayı durdur"
                  icon={<FaVolumeMute />}
                  size="sm"
                  colorScheme="prometaOrange"
                  onClick={stopSpeaking}
                />
              </Tooltip>
            </>
          )}
          <IconButton
            aria-label="Müşteriyi ara"
            icon={<PhoneIcon />}
            size="sm"
            colorScheme="prometa"
            variant="ghost"
          />
          <IconButton
            aria-label="Bilgi"
            icon={<InfoIcon />}
            size="sm"
            colorScheme="prometa"
            variant="ghost"
          />
        </HStack>
      </Flex>
      
      {/* Chat messages */}
      <VStack 
        flex="1" 
        overflowY="auto" 
        p={4} 
        spacing={4} 
        alignItems="stretch"
        bg="gray.50"
      >
        {messages.map((message) => (
          <Flex
            key={message.id}
            justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
          >
            <Box
              maxW="80%"
              bg={message.sender === 'user' ? 'prometaOrange.500' : 'white'}
              color={message.sender === 'user' ? 'white' : 'black'}
              p={3}
              borderRadius="lg"
              boxShadow="sm"
            >
              {message.sender === 'ai' && message.agentType && (
                <Badge 
                  colorScheme={getAgentBadgeColor(message.agentType)} 
                  mb={2}
                  fontSize="xs"
                >
                  {translateAgentType(message.agentType)} Ajanı
                </Badge>
              )}
              <Text>{message.text}</Text>
              <Flex justifyContent="space-between" alignItems="center" mt={1}>
                {message.sender === 'ai' && (
                  <IconButton
                    aria-label="Mesajı sesli dinle"
                    icon={<FaMicrophone size="12px" />}
                    size="xs"
                    colorScheme="prometa"
                    variant="ghost"
                    onClick={() => handleTextToSpeech(message.text)}
                  />
                )}
                <Text fontSize="xs" color={message.sender === 'user' ? 'prometaOrange.100' : 'gray.500'} ml="auto">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Flex>
            </Box>
          </Flex>
        ))}
        {isLoading && (
          <Flex justifyContent="flex-start">
            <Box bg="white" p={3} borderRadius="lg" boxShadow="sm">
              <Spinner size="sm" mr={2} color="prometa.500" />
              <Text as="span">Düşünüyor...</Text>
            </Box>
          </Flex>
        )}
        <div ref={messagesEndRef} />
      </VStack>
      
      <Divider />
      
      {/* Chat input */}
      <Flex p={4} bg="white">
        <Input 
          placeholder="Mesajınızı yazın..." 
          value={inputMessage} 
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          mr={2}
          borderColor="gray.300"
          _focus={{
            borderColor: "prometa.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-prometa-500)",
          }}
        />
        <IconButton
          colorScheme="prometa"
          aria-label="Mesaj gönder"
          icon={<ArrowForwardIcon />}
          onClick={handleSendMessage}
          isLoading={isLoading}
        />
        <IconButton
          colorScheme="prometa"
          variant="ghost"
          aria-label="Mic"
          icon={isListening ? <FaStop /> : <FaMicrophone />}
          ml={2}
          onClick={toggleSpeechRecognition}
          bg={isListening ? 'red.100' : 'transparent'}
          color={isListening ? 'red.500' : undefined}
        />
      </Flex>
      
      {/* Recording Modal */}
      <Modal isOpen={isOpen} onClose={() => {
        stopSpeechRecognition();
        onClose();
      }} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ses Kaydı</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="center">
              <Box p={4} borderRadius="full" bg="red.100" position="relative">
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  borderRadius="full"
                  bg="red.500"
                  opacity={0.4}
                  animation="pulse 1.5s infinite"
                />
                <FaMicrophone size="24px" color="red" />
              </Box>
              <Text fontWeight="medium">Konuşmaya Başlayın</Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Mikrofon açık, konuştuğunuz metin otomatik olarak çevirilecek ve gönderilecektir.
                2 saniyelik sessizlik sonrasında kayıt otomatik olarak duracak ve mesajınız iletilecektir.
              </Text>
              <Progress
                value={(recordingSeconds / 30) * 100}
                size="sm"
                colorScheme="red"
                width="100%"
                borderRadius="md"
              />
              <Text fontSize="sm">{recordingSeconds} / 30 saniye</Text>
              <Button 
                colorScheme="red" 
                leftIcon={<FaStop />} 
                onClick={() => {
                  stopSpeechRecognition();
                  if (inputMessage.trim()) {
                    handleSendMessage();
                  }
                }}
              >
                Kaydı Durdur ve Gönder
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ChatInterface; 