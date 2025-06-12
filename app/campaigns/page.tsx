'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Flex,
  Button,
  Tag,
  useColorModeValue,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider
} from '@chakra-ui/react';
import { SearchIcon, CheckCircleIcon, WarningIcon, TimeIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

// Interface for campaign data
interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  target: 'all' | 'new' | 'existing' | 'churn-risk';
  category: 'data' | 'voice' | 'bundle' | 'device' | 'loyalty';
  discount: number;
  status: 'active' | 'upcoming' | 'expired';
  eligibleCustomers: number;
  acceptanceRate: number;
  conversionRate: number;
  averageRevenueIncrease: number;
  terms: string[];
}

const CampaignsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'white');
  const highlightColor = useColorModeValue('prometa.500', 'prometa.300');
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Load campaign data
    const loadCampaigns = async () => {
      setIsLoading(true);
      
      // Generate mock campaign data
      const mockCampaigns: Campaign[] = [
        {
          id: 'camp-001',
          name: 'Yaz Fırsatı: 2x Data Paketi',
          description: 'Yaz aylarına özel, mevcut data paketinizin 2 katı kadar data kullanımı.',
          startDate: '01/06/2023',
          endDate: '31/08/2023',
          target: 'existing',
          category: 'data',
          discount: 0,
          status: 'active',
          eligibleCustomers: 35400,
          acceptanceRate: 42,
          conversionRate: 38,
          averageRevenueIncrease: 15.5,
          terms: [
            'Tüm mevcut müşteriler için geçerlidir',
            'Ek ücret talep edilmez',
            'Kullanılmayan data bir sonraki aya devretmez',
            'Normal paket kotası dolduktan sonra otomatik olarak aktif olur'
          ]
        },
        {
          id: 'camp-002',
          name: 'Akıllı Cihaz İndirimi',
          description: 'Seçili akıllı telefonlarda %25\'e varan indirim fırsatı.',
          startDate: '15/07/2023',
          endDate: '15/09/2023',
          target: 'all',
          category: 'device',
          discount: 25,
          status: 'active',
          eligibleCustomers: 55000,
          acceptanceRate: 28,
          conversionRate: 22,
          averageRevenueIncrease: 210.75,
          terms: [
            'Stoklar ile sınırlıdır',
            '24 ay taahhüt gerektirir',
            'Sadece belirli modeller için geçerlidir',
            'Kampanya diğer indirimlerle birleştirilemez'
          ]
        },
        {
          id: 'camp-003',
          name: 'Sadakat Programı Özel Teklifi',
          description: '5 yıldan uzun süredir müşterimiz olan kullanıcılara özel fırsatlar.',
          startDate: '01/01/2023',
          endDate: '31/12/2023',
          target: 'existing',
          category: 'loyalty',
          discount: 15,
          status: 'active',
          eligibleCustomers: 12800,
          acceptanceRate: 65,
          conversionRate: 58,
          averageRevenueIncrease: 22.3,
          terms: [
            'En az 5 yıllık müşteriler için geçerlidir',
            'Her ay fatura tutarından %15 indirim',
            'Otomatik olarak uygulanır',
            '12 ay boyunca geçerlidir'
          ]
        },
        {
          id: 'camp-004',
          name: 'Aile Paketi Kampanyası',
          description: 'Birden fazla hat için özel indirimli aile paketi.',
          startDate: '10/05/2023',
          endDate: '10/11/2023',
          target: 'all',
          category: 'bundle',
          discount: 20,
          status: 'active',
          eligibleCustomers: 28500,
          acceptanceRate: 48,
          conversionRate: 41,
          averageRevenueIncrease: 45.8,
          terms: [
            'En az 3 hat için geçerlidir',
            'Aynı fatura adresine sahip hatlar için geçerlidir',
            'Her hat için 10GB data, 1000dk konuşma ve 1000 SMS içerir',
            'Mevcut müşteriler tarifelerini değiştirebilir'
          ]
        },
        {
          id: 'camp-005',
          name: 'Sınırsız Hafta Sonu İnternet',
          description: 'Her hafta sonu sınırsız internet kullanımı.',
          startDate: '01/08/2023',
          endDate: '01/02/2024',
          target: 'churn-risk',
          category: 'data',
          discount: 0,
          status: 'active',
          eligibleCustomers: 18200,
          acceptanceRate: 72,
          conversionRate: 68,
          averageRevenueIncrease: 8.2,
          terms: [
            'Cumartesi 00:00 - Pazar 23:59 arasında geçerlidir',
            'Hız kısıtlaması yoktur',
            'Ayrılma riski yüksek müşteriler için önceliklidir',
            'Kampanya süresi boyunca her hafta sonu geçerlidir'
          ]
        },
        {
          id: 'camp-006',
          name: 'Öğrenci Kampanyası',
          description: 'Öğrencilere özel indirimli tarifeler ve extra avantajlar.',
          startDate: '15/09/2023',
          endDate: '30/06/2024',
          target: 'new',
          category: 'bundle',
          discount: 30,
          status: 'active',
          eligibleCustomers: 42000,
          acceptanceRate: 58,
          conversionRate: 52,
          averageRevenueIncrease: 18.5,
          terms: [
            'Geçerli öğrenci belgesi gereklidir',
            'Her yıl yenilenmelidir',
            '15GB data, 750dk konuşma ve sınırsız sosyal medya içerir',
            '26 yaş altı için geçerlidir'
          ]
        },
        {
          id: 'camp-007',
          name: 'Online İşlem Avantajı',
          description: 'Online kanallardan yapılan işlemlerde ek avantajlar.',
          startDate: '01/07/2023',
          endDate: '31/12/2023',
          target: 'all',
          category: 'loyalty',
          discount: 10,
          status: 'active',
          eligibleCustomers: 65000,
          acceptanceRate: 32,
          conversionRate: 28,
          averageRevenueIncrease: 5.2,
          terms: [
            'Online kanallardan yapılan fatura ödemelerinde geçerlidir',
            'Bir sonraki faturada 10₺ indirim olarak yansıtılır',
            'Her ay tekrarlanabilir',
            'Diğer kampanyalarla birleştirilebilir'
          ]
        },
        {
          id: 'camp-008',
          name: 'Premium Tarife Yükseltme',
          description: 'Mevcut müşteriler için premium tarife yükseltme avantajları.',
          startDate: '01/10/2023',
          endDate: '15/01/2024',
          target: 'existing',
          category: 'bundle',
          discount: 15,
          status: 'upcoming',
          eligibleCustomers: 22000,
          acceptanceRate: 0,
          conversionRate: 0,
          averageRevenueIncrease: 0,
          terms: [
            'Sadece mevcut müşteriler için geçerlidir',
            'İlk 3 ay için %15 indirim',
            'Premium tarife yükseltmelerinde geçerlidir',
            'Taahhüt gerektirmez'
          ]
        },
        {
          id: 'camp-009',
          name: 'Fiber İnternet Dönüşüm',
          description: 'ADSL kullanıcıları için Fiber internet geçiş kampanyası.',
          startDate: '01/05/2023',
          endDate: '01/06/2023',
          target: 'existing',
          category: 'data',
          discount: 40,
          status: 'expired',
          eligibleCustomers: 18500,
          acceptanceRate: 62,
          conversionRate: 55,
          averageRevenueIncrease: 35.2,
          terms: [
            'Sadece ADSL kullanıcıları için geçerlidir',
            'Fiber altyapı bulunan lokasyonlar için geçerlidir',
            'İlk 6 ay %40 indirimli',
            '24 ay taahhüt gerektirir'
          ]
        },
        {
          id: 'camp-010',
          name: 'Yeni Müşteri Özel Paketi',
          description: 'Yeni müşteriler için zengin içerikli özel paket.',
          startDate: '01/09/2023',
          endDate: '31/12/2023',
          target: 'new',
          category: 'bundle',
          discount: 35,
          status: 'upcoming',
          eligibleCustomers: 0,
          acceptanceRate: 0,
          conversionRate: 0,
          averageRevenueIncrease: 0,
          terms: [
            'Sadece yeni müşteriler için geçerlidir',
            'İlk yıl %35 indirimli',
            '25GB data, 2000dk konuşma ve sınırsız SMS içerir',
            '12 ay taahhüt gerektirir'
          ]
        }
      ];
      
      setCampaigns(mockCampaigns);
      setIsLoading(false);
    };
    
    loadCampaigns();
  }, [router]);
  
  // Filter campaigns based on search, category and status
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || campaign.category === filterCategory;
    
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Get campaigns by tab
  const getTabCampaigns = (tabIndex: number) => {
    switch (tabIndex) {
      case 0: // All campaigns
        return filteredCampaigns;
      case 1: // Active campaigns
        return filteredCampaigns.filter(c => c.status === 'active');
      case 2: // Upcoming campaigns
        return filteredCampaigns.filter(c => c.status === 'upcoming');
      case 3: // Expired campaigns
        return filteredCampaigns.filter(c => c.status === 'expired');
      default:
        return filteredCampaigns;
    }
  };
  
  // Get badge color for campaign status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'upcoming': return 'blue';
      case 'expired': return 'gray';
      default: return 'gray';
    }
  };
  
  // Get badge color for target audience
  const getTargetColor = (target: string) => {
    switch (target) {
      case 'all': return 'purple';
      case 'new': return 'blue';
      case 'existing': return 'teal';
      case 'churn-risk': return 'orange';
      default: return 'gray';
    }
  };
  
  // Get translated target audience
  const getTargetText = (target: string) => {
    switch (target) {
      case 'all': return 'Tümü';
      case 'new': return 'Yeni Müşteriler';
      case 'existing': return 'Mevcut Müşteriler';
      case 'churn-risk': return 'Ayrılma Riski';
      default: return target;
    }
  };
  
  // Get category text
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'data': return 'Veri Paketi';
      case 'voice': return 'Ses Paketi';
      case 'bundle': return 'Kombine Paket';
      case 'device': return 'Cihaz';
      case 'loyalty': return 'Sadakat';
      default: return category;
    }
  };
  
  // Get campaign statistics
  const getCampaignStats = () => {
    const active = campaigns.filter(c => c.status === 'active').length;
    const upcoming = campaigns.filter(c => c.status === 'upcoming').length;
    const expired = campaigns.filter(c => c.status === 'expired').length;
    
    const averageConversion = campaigns
      .filter(c => c.status === 'active' || c.status === 'expired')
      .reduce((sum, c) => sum + c.conversionRate, 0) / 
      (campaigns.filter(c => c.status === 'active' || c.status === 'expired').length || 1);
    
    return { active, upcoming, expired, total: campaigns.length, averageConversion };
  };
  
  const stats = getCampaignStats();
  
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Navbar />
      
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading as="h1" size="xl" mb={2} color={highlightColor}>
            Kampanyalar
          </Heading>
          <Text color={textColor}>
            Müşterileriniz için mevcut, yaklaşan ve geçmiş kampanyaları görüntüleyin ve yönetin....
          </Text>
        </Box>
        
        {/* Campaign Stats */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
          <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
            <Stat>
              <StatLabel>Aktif Kampanyalar</StatLabel>
              <StatNumber color="green.500">{stats.active}</StatNumber>
              <StatHelpText>Yürürlükte olan kampanyalar</StatHelpText>
            </Stat>
          </Box>
          
          <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
            <Stat>
              <StatLabel>Yaklaşan Kampanyalar</StatLabel>
              <StatNumber color="blue.500">{stats.upcoming}</StatNumber>
              <StatHelpText>Yakında başlayacak kampanyalar</StatHelpText>
            </Stat>
          </Box>
          
          <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
            <Stat>
              <StatLabel>Sona Eren Kampanyalar</StatLabel>
              <StatNumber color="gray.500">{stats.expired}</StatNumber>
              <StatHelpText>Geçmiş kampanyalar</StatHelpText>
            </Stat>
          </Box>
          
          <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
            <Stat>
              <StatLabel>Ortalama Dönüşüm Oranı</StatLabel>
              <StatNumber color="orange.500">%{stats.averageConversion.toFixed(1)}</StatNumber>
              <StatHelpText>Tüm kampanyalar</StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>
        
        {/* Search and Filters */}
        <Flex mb={6} wrap="wrap" gap={4} align="center" justify="space-between">
          <Box flex={{ base: '1 1 100%', md: '2' }}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input 
                placeholder="Kampanya ara..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={cardBg}
              />
            </InputGroup>
          </Box>
          
          <HStack spacing={4} flex={{ base: '1 1 100%', md: '1' }} justify={{ base: 'space-between', md: 'flex-end' }}>
            <Select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              bg={cardBg}
              maxW="180px"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="data">Veri Paketleri</option>
              <option value="voice">Ses Paketleri</option>
              <option value="bundle">Kombine Paketler</option>
              <option value="device">Cihazlar</option>
              <option value="loyalty">Sadakat Programları</option>
            </Select>
            
            <Select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              bg={cardBg}
              maxW="150px"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="upcoming">Yaklaşan</option>
              <option value="expired">Sona Ermiş</option>
            </Select>
          </HStack>
        </Flex>
        
        {/* Campaign Tabs */}
        <Tabs colorScheme="prometa" onChange={(index) => setActiveTab(index)} mb={6}>
          <TabList>
            <Tab>Tüm Kampanyalar ({filteredCampaigns.length})</Tab>
            <Tab>Aktif Kampanyalar ({filteredCampaigns.filter(c => c.status === 'active').length})</Tab>
            <Tab>Yaklaşan Kampanyalar ({filteredCampaigns.filter(c => c.status === 'upcoming').length})</Tab>
            <Tab>Sona Eren Kampanyalar ({filteredCampaigns.filter(c => c.status === 'expired').length})</Tab>
          </TabList>
          
          <TabPanels>
            {[0, 1, 2, 3].map((tabIndex) => (
              <TabPanel key={tabIndex} p={0} pt={6}>
                {isLoading ? (
                  <Flex justify="center" align="center" minH="300px">
                    <Spinner size="xl" color="prometa.500" />
                  </Flex>
                ) : getTabCampaigns(tabIndex).length === 0 ? (
                  <Box textAlign="center" p={10} bg={cardBg} borderRadius="lg">
                    <Text fontSize="lg">Gösterilecek kampanya bulunamadı</Text>
                    <Text fontSize="sm" color="gray.500" mt={2}>Lütfen arama kriterlerinizi değiştirerek tekrar deneyin.</Text>
                  </Box>
                ) : (
                  <VStack spacing={6} align="stretch">
                    {getTabCampaigns(tabIndex).map((campaign) => (
                      <Box 
                        key={campaign.id} 
                        bg={cardBg} 
                        p={6} 
                        borderRadius="lg" 
                        boxShadow="sm"
                        borderLeft="4px solid"
                        borderLeftColor={campaign.status === 'active' 
                          ? 'green.400' 
                          : campaign.status === 'upcoming' 
                            ? 'blue.400' 
                            : 'gray.400'
                        }
                      >
                        <Flex 
                          direction={{ base: 'column', md: 'row' }} 
                          justify="space-between" 
                          align={{ base: 'flex-start', md: 'center' }}
                          mb={4}
                        >
                          <Box mb={{ base: 4, md: 0 }}>
                            <HStack mb={2}>
                              <Heading as="h3" size="md">{campaign.name}</Heading>
                              <Badge colorScheme={getStatusColor(campaign.status)} borderRadius="full" px={2}>
                                {campaign.status === 'active' ? 'Aktif' : campaign.status === 'upcoming' ? 'Yaklaşan' : 'Sona Ermiş'}
                              </Badge>
                            </HStack>
                            <HStack spacing={2}>
                              <Tag size="sm" colorScheme={getTargetColor(campaign.target)} borderRadius="full">
                                {getTargetText(campaign.target)}
                              </Tag>
                              <Tag size="sm" colorScheme="teal" borderRadius="full">
                                {getCategoryText(campaign.category)}
                              </Tag>
                              {campaign.discount > 0 && (
                                <Tag size="sm" colorScheme="red" borderRadius="full">
                                  %{campaign.discount} İndirim
                                </Tag>
                              )}
                            </HStack>
                          </Box>
                          
                          <HStack spacing={2}>
                            <Button colorScheme="prometa" size="sm" isDisabled={campaign.status === 'expired'}>
                              Detaylar
                            </Button>
                          </HStack>
                        </Flex>
                        
                        <Text color={textColor} mb={4}>{campaign.description}</Text>
                        
                        <Flex 
                          justify="space-between" 
                          align="center" 
                          wrap="wrap"
                          bg={useColorModeValue('gray.50', 'gray.700')}
                          p={3}
                          borderRadius="md"
                          mb={4}
                        >
                          <HStack spacing={1} mb={{ base: 2, md: 0 }}>
                            <TimeIcon color="gray.500" />
                            <Text fontSize="sm" color="gray.500">
                              {campaign.startDate} - {campaign.endDate}
                            </Text>
                          </HStack>
                          
                          {campaign.status !== 'upcoming' && (
                            <HStack spacing={4}>
                              <Stat size="sm">
                                <StatLabel fontSize="xs">Uygun Müşteriler</StatLabel>
                                <StatNumber fontSize="md">{campaign.eligibleCustomers.toLocaleString()}</StatNumber>
                              </Stat>
                              
                              <Stat size="sm">
                                <StatLabel fontSize="xs">Kabul Oranı</StatLabel>
                                <StatNumber fontSize="md">%{campaign.acceptanceRate}</StatNumber>
                              </Stat>
                              
                              <Stat size="sm">
                                <StatLabel fontSize="xs">Dönüşüm</StatLabel>
                                <StatNumber fontSize="md">%{campaign.conversionRate}</StatNumber>
                              </Stat>
                            </HStack>
                          )}
                        </Flex>
                        
                        <Accordion allowToggle>
                          <AccordionItem border="none">
                            <h2>
                              <AccordionButton 
                                _hover={{ bg: 'transparent' }} 
                                p={0}
                                color={highlightColor}
                              >
                                <Box flex="1" textAlign="left" fontWeight="medium">
                                  Kampanya Koşulları
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4} px={0}>
                              <VStack align="stretch" spacing={1}>
                                {campaign.terms.map((term, idx) => (
                                  <HStack key={idx} align="flex-start">
                                    <CheckCircleIcon color="green.500" mt={1} />
                                    <Text fontSize="sm">{term}</Text>
                                  </HStack>
                                ))}
                              </VStack>
                            </AccordionPanel>
                          </AccordionItem>
                        </Accordion>
                      </Box>
                    ))}
                  </VStack>
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default CampaignsPage; 