'use client';

import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Flex,
  Tag,
  useColorModeValue,
  Image,
  Link,
  Heading,
} from '@chakra-ui/react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      bg={useColorModeValue('white', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      borderTopWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      mt={12}
    >
      <Container as={Stack} maxW="container.xl" py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align="flex-start">
            <Heading as="h5" size="sm" color="prometa.600" mb={2}>
              Şirket
            </Heading>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>Hakkımızda</Link>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>Kariyer</Link>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>İletişim</Link>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>Blog</Link>
          </Stack>
          
          <Stack align="flex-start">
            <Heading as="h5" size="sm" color="prometa.600" mb={2}>
              Çözümler
            </Heading>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>Müşteri Tutundurma</Link>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>Satış Arttırma</Link>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>Veri Analizi</Link>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>Süreç Optimizasyonu</Link>
          </Stack>
          
          <Stack align="flex-start">
            <Heading as="h5" size="sm" color="prometa.600" mb={2}>
              Destek
            </Heading>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>Yardım Merkezi</Link>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>Dokümantasyon</Link>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>API Referansı</Link>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>Güvenlik</Link>
          </Stack>
          
          <Stack align="flex-start">
            <Heading as="h5" size="sm" color="prometa.600" mb={2}>
              Bizi Takip Edin
            </Heading>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>LinkedIn</Link>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>Twitter</Link>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>Facebook</Link>
            <Link href="#" color="gray.600" _hover={{ color: 'prometa.600' }}>Instagram</Link>
          </Stack>
        </SimpleGrid>
      </Container>
      
      <Box py={5} borderTopWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
        <Flex
          align="center"
          _before={{
            content: '""',
            borderBottom: '1px solid',
            borderColor: useColorModeValue('gray.200', 'gray.700'),
            flexGrow: 1,
            mr: 8,
          }}
          _after={{
            content: '""',
            borderBottom: '1px solid',
            borderColor: useColorModeValue('gray.200', 'gray.700'),
            flexGrow: 1,
            ml: 8,
          }}
        >
          <Image src="/prometa_logo.svg" height="30px" alt="Prometa.ai Logo" />
        </Flex>
        <Container maxW="container.xl">
          <Text pt={6} fontSize="sm" textAlign="center">
            © {currentYear} Prometa.ai - Tüm hakları saklıdır.
          </Text>
        </Container>
      </Box>
    </Box>
  );
} 