'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  InputGroup,
  InputRightElement,
  useToast,
  Image,
  Flex,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';

// Mock kullanıcı verileri (gerçek uygulamada bir veritabanı kullanılmalıdır)
const MOCK_USERS = [
  { username: 'admin', password: 'prometa2023' },
  { username: 'prometa', password: 'prometaisfuture#2025' },
];

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  
  const formBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Basit doğrulama (gerçekte bu güvenli değildir - sadece demo amaçlıdır)
    setTimeout(() => {
      const user = MOCK_USERS.find(
        (user) => user.username === username && user.password === password
      );

      if (user) {
        toast({
          title: 'Giriş başarılı',
          description: 'Hoş geldiniz! Yönlendiriliyorsunuz...',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        
        // Kullanıcı bilgilerini localStorage'a kaydediyoruz (gerçek uygulamada daha güvenli yöntemler kullanılmalıdır)
        localStorage.setItem('user', JSON.stringify({ username: user.username }));
        
        // Ana sayfaya yönlendirme
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        toast({
          title: 'Giriş başarısız',
          description: 'Kullanıcı adı veya şifre hatalı.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      
      setIsLoading(false);
    }, 1000); // Gerçek API çağrısı simülasyonu için gecikme
  };

  return (
    <Box 
      p={8} 
      maxWidth="450px" 
      width="100%"
      borderWidth={1} 
      borderRadius="lg" 
      boxShadow="lg"
      bg={formBg}
      borderColor={borderColor}
    >
      <Flex direction="column" alignItems="center" mb={8}>
        <Box 
          width="100%" 
          maxWidth="300px"
          mb={5}
          display="flex"
          justifyContent="center"
          overflow="visible"
        >
          <Image 
            src="/prometa_logo.svg" 
            alt="Prometa.ai Logo" 
            width="100%"
            draggable={false}
          />
        </Box>
        <Heading size="lg" textAlign="center" color="prometa.600">Giriş Yap</Heading>
        <Text mt={2} color="gray.500">Prometa.ai Müşteri Tutundurma Platformu</Text>
      </Flex>
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={5}>
          <FormControl id="username" isRequired>
            <FormLabel>Kullanıcı Adı</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adınızı girin"
              borderColor={borderColor}
              _focus={{
                borderColor: "prometa.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-prometa-500)",
              }}
            />
          </FormControl>
          
          <FormControl id="password" isRequired>
            <FormLabel>Şifre</FormLabel>
            <InputGroup size="md">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                borderColor={borderColor}
                _focus={{
                  borderColor: "prometa.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-prometa-500)",
                }}
              />
              <InputRightElement>
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  size="sm"
                  tabIndex={-1}
                >
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          
          <Button
            colorScheme="prometa"
            size="lg"
            width="100%"
            mt={4}
            type="submit"
            isLoading={isLoading}
            loadingText="Giriş yapılıyor..."
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
          >
            Giriş Yap
          </Button>
          
          <Link fontSize="sm" color="prometa.600" alignSelf="flex-end">
            Şifremi unuttum
          </Link>
        </VStack>
      </form>
    </Box>
  );
} 