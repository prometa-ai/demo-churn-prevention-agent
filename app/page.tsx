'use client';

import { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  Flex,
  Image,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import CustomerDashboard from './components/CustomerDashboard';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './styles/theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const router = useRouter();

  useEffect(() => {
    // Kullanıcı giriş yapmış mı kontrol et
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      if (!user) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
        // Simulate loading data
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
      }
    };
    
    checkAuth();
  }, [router]);

  // Yükleme durumunda veya henüz kimlik doğrulaması yapılmadıysa bir şey gösterme
  if (isLoading || !isAuthenticated) {
    return (
      <ChakraProvider theme={theme}>
        <Box 
          minH="100vh" 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          bg="gray.50"
        >
          <Text fontSize="lg">Yükleniyor...</Text>
        </Box>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
        <Navbar />
        
        <Container maxW="container.xl" py={8} flex="1">
          <VStack spacing={8} align="stretch">
            <Box 
              textAlign="center" 
              py={6}
              px={6} 
              borderRadius="lg" 
              bg="black" 
              boxShadow="md"
              color="white"
            >
              <Flex direction="column" alignItems="center" justifyContent="center">
                <Box width="600px" height="200px" mb={2}>
                  <Image 
                    src="/vodafone_logo.png" 
                    alt="Vodafone Logo" 
                    width="100%"
                    height="100%"
                    objectFit="contain"
                  />
                </Box>
                <Text fontSize="lg" color="white" mt={2}>
                  Yapay Zeka Destekli Müşteri Tutundurma Platformu
                </Text>
              </Flex>
            </Box>
            
            <CustomerDashboard />
          </VStack>
        </Container>
        
        <Footer />
      </Box>
    </ChakraProvider>
  );
} 