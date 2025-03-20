'use client';

import { 
  Box, 
  Flex, 
  HStack, 
  IconButton, 
  Button, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  MenuDivider, 
  useDisclosure, 
  useColorModeValue, 
  Stack, 
  Text,
  Container,
  useToast
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavLinkProps {
  children: React.ReactNode;
  href: string;
}

const NavLink = (props: NavLinkProps) => {
  const { children, href } = props;
  return (
    <Box
      as={Link}
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('prometa.50', 'prometa.900'),
      }}
      href={href}>
      {children}
    </Box>
  );
};

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [username, setUsername] = useState('');
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    // Kullanıcı adını localStorage'dan al
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUsername(userData.username || 'Kullanıcı');
      } catch (e) {
        setUsername('Kullanıcı');
      }
    }
  }, []);

  const handleLogout = () => {
    // localStorage'dan kullanıcı bilgilerini temizle
    localStorage.removeItem('user');
    
    // Başarılı çıkış mesajı göster
    toast({
      title: 'Çıkış yapıldı',
      description: 'Başarıyla çıkış yaptınız.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    
    // Login sayfasına yönlendir
    router.push('/login');
  };

  return (
    <Box bg={useColorModeValue('white', 'gray.800')} px={4} boxShadow="sm">
      <Container maxW="container.xl">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              <NavLink href={'/'}>Dashboard</NavLink>
              <NavLink href={'/customers'}>Müşteriler</NavLink>
              <NavLink href={'/campaigns'}>Kampanyalar</NavLink>
              <NavLink href={'/reports'}>Raporlar</NavLink>
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            <Menu>
              <MenuButton
                as={Button}
                variant={'ghost'}
                rightIcon={<ChevronDownIcon />}
                _hover={{ bg: 'prometa.50' }}>
                <Text>{username || 'Kullanıcı'}</Text>
              </MenuButton>
              <MenuList>
                <MenuItem>Profil</MenuItem>
                <MenuItem>Ayarlar</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Çıkış</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              <NavLink href={'/'}>Dashboard</NavLink>
              <NavLink href={'/customers'}>Müşteriler</NavLink>
              <NavLink href={'/campaigns'}>Kampanyalar</NavLink>
              <NavLink href={'/reports'}>Raporlar</NavLink>
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
} 