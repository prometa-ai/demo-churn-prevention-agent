'use client';

import { useEffect, useState } from 'react';
import { Box, Flex, Container, useColorModeValue } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import LoginForm from '../components/LoginForm';
import theme from '../styles/theme';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const bgGradient = useColorModeValue(
    'linear(to-b, prometa.50, gray.50)',
    'linear(to-b, gray.900, gray.800)'
  );

  useEffect(() => {
    // Kullanıcı zaten giriş yapmış mı kontrol et
    const user = localStorage.getItem('user');
    if (user) {
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return <Box>Yükleniyor...</Box>;
  }

  return (
    <ChakraProvider theme={theme}>
      <Box 
        minH="100vh" 
        bgGradient={bgGradient}
        py={10}
      >
        <Container maxW="container.xl" py={8}>
          <Flex 
            minHeight="80vh" 
            alignItems="center" 
            justifyContent="center"
            px={4}
          >
            <LoginForm />
          </Flex>
        </Container>
      </Box>
    </ChakraProvider>
  );
} 