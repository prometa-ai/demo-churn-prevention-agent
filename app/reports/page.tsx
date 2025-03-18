'use client';

import { useEffect, useState } from 'react';
import { Box, Container } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import theme from '../styles/theme';
import Navbar from '../components/Navbar';
import Reports from '../components/Reports';
import Footer from '../components/Footer';

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Kullanıcı giriş yapmış mı kontrol et
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      if (!user) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
        setIsLoading(false);
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
          <Box>Yükleniyor...</Box>
        </Box>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
        <Navbar />
        
        <Container maxW="container.xl" py={8} flex="1">
          <Reports />
        </Container>
        
        <Footer />
      </Box>
    </ChakraProvider>
  );
} 