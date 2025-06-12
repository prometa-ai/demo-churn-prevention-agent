'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import CustomerDashboard from '../components/CustomerDashboard';

const CustomersPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Colors
  const textColor = useColorModeValue('gray.700', 'white');
  const highlightColor = useColorModeValue('prometa.500', 'prometa.300');
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Navbar />
      
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading as="h1" size="xl" mb={2} color={highlightColor}>
            Müşteri Yönetimi
          </Heading>
          <Text color={textColor}>
            Müşterilerinizi görüntüleyin, ayrılma risklerini analiz edin ve kişiselleştirilmiş iletişim stratejileri uygulayın.
          </Text>
        </Box>
        
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
            <Spinner size="xl" color="prometa.500" />
          </Box>
        ) : (
          <CustomerDashboard />
        )}
      </Container>
    </Box>
  );
};

export default CustomersPage; 