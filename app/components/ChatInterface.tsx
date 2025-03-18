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
} from '@chakra-ui/react';
import { ArrowForwardIcon, PhoneIcon, InfoIcon } from '@chakra-ui/icons';
import { FaMicrophone } from 'react-icons/fa';
import { Customer } from '../models/Customer';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with a welcome message
  useEffect(() => {
    const initialMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      text: generateProactiveInitialMessage(customer),
      timestamp: new Date(),
      agentType: 'personalization'
    };
    
    setMessages([initialMessage]);
  }, [customer.name]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Determine which agent type to use based on the message content
      const agentType = determineAgentType(inputMessage);
      
      // Call the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          customer,
          agentType,
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
        text: data.response || generateMockAIResponse(inputMessage, customer).text,
        timestamp: new Date(),
        agentType,
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      
      // Simulate text-to-speech
      handleTextToSpeech(aiResponse.text);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback to mock response in case of error
      const aiResponse = generateMockAIResponse(inputMessage, customer);
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      
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

  const handleTextToSpeech = (text: string) => {
    // In a real implementation, this would call the TTS service
    // For now, we'll just simulate the speaking state
    setIsSpeaking(true);
    setTimeout(() => {
      setIsSpeaking(false);
    }, 3000);
  };

  const toggleSpeechRecognition = () => {
    // In a real implementation, this would toggle speech recognition
    setIsListening(!isListening);
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

  // Mock function to generate AI responses
  const generateMockAIResponse = (userMessage: string, customer: Customer): ChatMessage => {
    const lowerCaseMessage = userMessage.toLowerCase();
    let responseText = '';
    let agentType: 'orchestrator' | 'outreach' | 'personalization' | 'rag' = 'orchestrator';
    
    // Detect potential churn signals in user message
    const churnSignals = [
      'iptal', 'ayrılmak', 'bırakmak', 'değiştirmek', 'geçmek', 'pahalı', 
      'memnun değilim', 'sorun', 'problem', 'kötü', 'yavaş', 'rakip', 
      'diğer operatör', 'başka şirket'
    ];
    
    const hasChurnSignal = churnSignals.some(signal => lowerCaseMessage.includes(signal));
    
    // If customer shows signs of wanting to leave
    if (hasChurnSignal) {
      responseText = `${customer.name} Bey/Hanım, endişelerinizi anlıyorum ve sizi müşterimiz olarak tutmak bizim için çok önemli. ${customer.customerSince} tarihinden beri bizimle olduğunuz için size özel bir sadakat indirimi sunabiliriz. Mevcut ${customer.plan.name} paketinize ek olarak, 3 ay boyunca %20 indirim ve ekstra 5GB veri hediyemiz olsun. Ayrıca, yaşadığınız sorunları çözmek için özel bir müşteri temsilcisi atayabiliriz. Bu teklifimiz hakkında ne düşünürsünüz?`;
      agentType = 'outreach';
    }
    // Simple keyword-based responses with proactive suggestions
    else if (lowerCaseMessage.includes('fatura') || lowerCaseMessage.includes('ödeme')) {
      if (customer.billing.paymentStatus === 'overdue') {
        responseText = `Mevcut faturanız ${customer.billing.currentBill.toFixed(2)}₺ olup son ödeme tarihi geçmiş durumda. Ancak endişelenmeyin, size özel olarak herhangi bir gecikme ücreti yansıtmadan ödeme yapabilirsiniz. Ayrıca, otomatik ödeme talimatı verirseniz, gelecekteki faturalarınızda %5 indirim sağlayabiliriz. Bu konuda yardımcı olabilir miyim?`;
      } else {
        responseText = `Mevcut faturanız ${customer.billing.currentBill.toFixed(2)}₺ olup son ödeme tarihi ${customer.billing.dueDate}. Ödeme durumunuz: ${customer.billing.paymentStatus === 'paid' ? 'Ödendi' : customer.billing.paymentStatus === 'pending' ? 'Beklemede' : 'Gecikmiş'}. Faturalarınızı daha kolay yönetmek için otomatik ödeme talimatı vermenizi öneririm, bu sayede %5 indirim kazanabilirsiniz. Yardımcı olabilir miyim?`;
      }
      agentType = 'rag';
    } else if (lowerCaseMessage.includes('paket') || lowerCaseMessage.includes('yükseltme')) {
      // Check if there's a better plan based on usage
      const dataUsagePercent = (customer.usage.dataUsage.current / customer.usage.dataUsage.limit) * 100;
      const callUsagePercent = (customer.usage.callUsage.current / customer.usage.callUsage.limit) * 100;
      
      if (dataUsagePercent > 90 || callUsagePercent > 90) {
        responseText = `Şu anda ${customer.plan.name} paketini kullanıyorsunuz ve aylık ${customer.plan.monthlyCost.toFixed(2)}₺ ödüyorsunuz. Kullanım alışkanlıklarınıza baktığımda, veri ve arama kullanımınızın oldukça yüksek olduğunu görüyorum. Size özel bir teklifle, sadece ${(customer.plan.monthlyCost * 1.2).toFixed(2)}₺ karşılığında %50 daha fazla veri ve dakika içeren bir pakete geçiş yapabilirsiniz. İlk 3 ay için ek %10 indirim de sağlayabiliriz. Bu teklif hakkında detaylı bilgi almak ister misiniz?`;
      } else if (dataUsagePercent < 50 && callUsagePercent < 50 && customer.plan.name !== 'Temel') {
        responseText = `Şu anda ${customer.plan.name} paketini kullanıyorsunuz ve aylık ${customer.plan.monthlyCost.toFixed(2)}₺ ödüyorsunuz. Kullanım alışkanlıklarınıza baktığımda, mevcut paketinizin kapasitesini tam olarak kullanmadığınızı görüyorum. Size özel bir optimizasyon yaparak, ihtiyaçlarınıza daha uygun ve daha ekonomik bir paket önerebilirim. Bu sayede aylık ödemelerinizde tasarruf sağlayabilirsiniz. İlgilenirseniz detayları paylaşabilirim.`;
      } else {
        responseText = `Şu anda ${customer.plan.name} paketini kullanıyorsunuz ve aylık ${customer.plan.monthlyCost.toFixed(2)}₺ ödüyorsunuz. Kullanım alışkanlıklarınıza göre, bu paket ihtiyaçlarınıza oldukça uygun görünüyor. Ancak yine de size özel kampanyalarımız mevcut. Örneğin, aile üyeleriniz için ek hatlar eklerseniz, her hat için %15 indirim sağlayabiliriz. Ayrıca, yıllık taahhüt verirseniz, aylık faturanızda %10 indirim yapabiliriz. Bu tekliflerden herhangi biri ilginizi çeker mi?`;
      }
      agentType = 'personalization';
    } else if (lowerCaseMessage.includes('veri') || lowerCaseMessage.includes('kullanım') || lowerCaseMessage.includes('internet')) {
      const dataPercentage = Math.round((customer.usage.dataUsage.current / customer.usage.dataUsage.limit) * 100);
      
      if (dataPercentage > 80) {
        responseText = `Bu ay ${customer.usage.dataUsage.limit}GB veri hakkınızın ${customer.usage.dataUsage.current}GB'ını kullandınız (%${dataPercentage}). Veri kullanımınız oldukça yüksek görünüyor. Size özel olarak, bu ay için 5GB ek veri paketi ekleyebiliriz. Ayrıca, düzenli olarak yüksek veri kullanımınız olduğunu görüyorum. Bir üst pakete geçiş yaparsanız, ilk 3 ay için %15 indirim sağlayabiliriz. Bu konuda yardımcı olabilir miyim?`;
      } else {
        responseText = `Bu ay ${customer.usage.dataUsage.limit}GB veri hakkınızın ${customer.usage.dataUsage.current}GB'ını kullandınız (%${dataPercentage}). Veri kullanımınız şu an için limitler dahilinde. Size özel bir öneri olarak, kullanmadığınız veriyi bir sonraki aya aktarabileceğiniz 'Veri Aktarım' hizmetimizi aktifleştirebiliriz. Bu sayede hiçbir veri hakkınız boşa gitmez. İlgilenirseniz hemen aktifleştirebilirim.`;
      }
      agentType = 'rag';
    } else {
      // Default response with personalized offer
      const customerAge = new Date().getFullYear() - new Date(customer.customerSince).getFullYear();
      
      if (customerAge >= 2) {
        responseText = `${customer.name} Bey/Hanım, ${customerAge} yıldır değerli müşterimiz olduğunuz için size özel bir sadakat teklifimiz var. Mevcut paketinize ek olarak, ücretsiz 3 aylık dijital TV paketi veya 10GB ek veri hediye edebiliriz. Ayrıca, yeni cihaz alımlarında size özel %20 indirim kuponu tanımlayabiliriz. Hangi hediyemiz ilginizi çeker?`;
      } else {
        responseText = `${customer.name} Bey/Hanım, bizimle olduğunuz için teşekkür ederiz. Size özel olarak, arkadaşlarınızı referans gösterirseniz, hem size hem de arkadaşınıza 5GB ek veri hediye edebiliriz. Ayrıca, mobil uygulamamızı indirip kullanmaya başlarsanız, ilk ay faturanızda %10 indirim sağlayabiliriz. Bu fırsatlardan yararlanmak ister misiniz?`;
      }
      agentType = 'personalization';
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

  // Function to generate a personalized initial message based on customer data
  const generateProactiveInitialMessage = (customer: Customer): string => {
    // Check for high churn risk
    if (customer.churnProbability > 0.7) {
      return `Merhaba ${customer.name}, ${customer.customerSince} tarihinden beri değerli müşterimiz olduğunuz için teşekkür ederiz. Kullanım alışkanlıklarınıza göre, mevcut ${customer.plan.name} paketinizden daha avantajlı olabilecek yeni Premium paketimiz hakkında bilgi vermek istedim. Yeni paketimiz daha fazla veri ve konuşma süresi içeriyor ve sizin için özel bir indirimle sunabiliriz. Detayları öğrenmek ister misiniz?`;
    }
    
    // Check for high data usage
    const dataUsagePercent = (customer.usage.dataUsage.current / customer.usage.dataUsage.limit) * 100;
    if (dataUsagePercent > 80) {
      return `Merhaba ${customer.name}, veri kullanımınızın limitinize yaklaştığını fark ettim. Bu ay ${customer.usage.dataUsage.limit}GB veri hakkınızın %${Math.round(dataUsagePercent)}'ini kullandınız. Size daha yüksek veri limitli bir paket önerebilir veya mevcut paketinize ek veri paketi ekleyebiliriz. Nasıl yardımcı olabilirim?`;
    }
    
    // Check for payment issues
    if (customer.billing.paymentStatus === 'overdue' || customer.billing.paymentStatus === 'pending') {
      return `Merhaba ${customer.name}, ${customer.customerSince} tarihinden beri müşterimiz olduğunuz için teşekkür ederiz. Son faturanızla ilgili bir ödeme beklemesi olduğunu görüyorum. Size ödeme seçenekleri konusunda yardımcı olmak veya faturanızla ilgili herhangi bir sorunuz varsa yanıtlamak için buradayım.`;
    }
    
    // Check for recent plan change or upgrade opportunity
    if (customer.notes.some(note => note.includes('paket yükseltme') || note.includes('değişikliğinden memnuniyet'))) {
      return `Merhaba ${customer.name}, ${customer.plan.name} paketinizden memnun olduğunuzu görmek harika! Size özel yeni kampanyalarımız ve ek hizmetlerimiz hakkında bilgi vermek istedim. Mevcut paketinize ekleyebileceğiniz ve deneyiminizi daha da iyileştirebilecek bazı fırsatlarımız var. Detayları duymak ister misiniz?`;
    }
    
    // Default personalized message
    return `Merhaba ${customer.name}, ${customer.customerSince} tarihinden beri değerli müşterimiz olduğunuz için teşekkür ederiz. ${customer.plan.name} paketinizin kullanımını inceledim ve size özel bazı önerilerim var. Kullanım alışkanlıklarınıza göre daha uygun olabilecek fırsatları değerlendirmek ister misiniz?`;
  };

  // Function to determine which agent type to use based on the message content
  const determineAgentType = (message: string): 'orchestrator' | 'outreach' | 'personalization' | 'rag' => {
    const lowerCaseMessage = message.toLowerCase();
    
    // Check for campaign or plan related queries - use RAG agent
    if (lowerCaseMessage.includes('kampanya') || 
        lowerCaseMessage.includes('tarife') || 
        lowerCaseMessage.includes('paket') || 
        lowerCaseMessage.includes('teklif') || 
        lowerCaseMessage.includes('fırsat') ||
        lowerCaseMessage.includes('vodafone')) {
      return 'rag';
    }
    
    // Check for churn signals - use outreach agent
    const churnSignals = [
      'iptal', 'ayrılmak', 'bırakmak', 'değiştirmek', 'geçmek', 'pahalı', 
      'memnun değilim', 'sorun', 'problem', 'kötü', 'yavaş', 'rakip', 
      'diğer operatör', 'başka şirket'
    ];
    
    if (churnSignals.some(signal => lowerCaseMessage.includes(signal))) {
      return 'outreach';
    }
    
    // Check for billing or payment related queries - use RAG agent
    if (lowerCaseMessage.includes('fatura') || 
        lowerCaseMessage.includes('ödeme') || 
        lowerCaseMessage.includes('borç') || 
        lowerCaseMessage.includes('hesap')) {
      return 'rag';
    }
    
    // Check for usage related queries - use personalization agent
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
            <Badge colorScheme="prometaOrange" variant="solid">
              Konuşuyor
            </Badge>
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
              <Text fontSize="xs" color={message.sender === 'user' ? 'prometaOrange.100' : 'gray.500'} textAlign="right" mt={1}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
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
          icon={<FaMicrophone />}
          ml={2}
          onClick={toggleSpeechRecognition}
          bg={isListening ? 'prometa.100' : 'transparent'}
        />
      </Flex>
    </Box>
  );
};

export default ChatInterface; 