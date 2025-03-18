'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';

// Mock veri: Aylık görüşme ve tutundurma verileri
const mockConversationData = [
  { month: 'Oca', count: 245, retention3m: 82, retention6m: 68, retention12m: 55 },
  { month: 'Şub', count: 310, retention3m: 85, retention6m: 72, retention12m: 57 },
  { month: 'Mar', count: 285, retention3m: 79, retention6m: 65, retention12m: 52 },
  { month: 'Nis', count: 350, retention3m: 88, retention6m: 75, retention12m: 60 },
  { month: 'May', count: 320, retention3m: 84, retention6m: 71, retention12m: 58 },
  { month: 'Haz', count: 380, retention3m: 87, retention6m: 74, retention12m: 61 },
  { month: 'Tem', count: 420, retention3m: 89, retention6m: 78, retention12m: 64 },
  { month: 'Ağu', count: 390, retention3m: 86, retention6m: 73, retention12m: 59 },
  { month: 'Eyl', count: 410, retention3m: 88, retention6m: 76, retention12m: 62 },
  { month: 'Eki', count: 450, retention3m: 91, retention6m: 80, retention12m: 67 },
  { month: 'Kas', count: 480, retention3m: 93, retention6m: 82, retention12m: 69 },
  { month: 'Ara', count: 520, retention3m: 94, retention6m: 85, retention12m: 72 },
];

// Mock veri: Kampanya bazlı tutundurma oranları
const mockCampaignData = [
  { campaign: 'Sadakat İndirimi (%15)', count: 850, retention3m: 89, retention6m: 76, retention12m: 65 },
  { campaign: 'Ek Veri Paketi (10GB)', count: 720, retention3m: 84, retention6m: 72, retention12m: 58 },
  { campaign: 'Ücretsiz Premium Servis (3 Ay)', count: 680, retention3m: 87, retention6m: 74, retention12m: 60 },
  { campaign: 'AI-Agent Hiper-Kişiselleştirme', count: 960, retention3m: 95, retention6m: 88, retention12m: 78 },
  { campaign: 'Özel Teklif', count: 510, retention3m: 82, retention6m: 70, retention12m: 57 },
];

// Mock veri: Segment bazlı tutundurma oranları
const mockSegmentData = [
  { segment: 'Yüksek Değerli (ARPU > 300₺)', count: 480, retention3m: 94, retention6m: 86, retention12m: 75 },
  { segment: 'Orta Değerli (ARPU 150₺-300₺)', count: 1250, retention3m: 88, retention6m: 76, retention12m: 64 },
  { segment: 'Düşük Değerli (ARPU < 150₺)', count: 890, retention3m: 82, retention6m: 68, retention12m: 52 },
  { segment: 'Yeni Müşteriler (< 6 Ay)', count: 620, retention3m: 78, retention6m: 65, retention12m: 48 },
  { segment: 'Sadık Müşteriler (> 3 Yıl)', count: 540, retention3m: 96, retention6m: 92, retention12m: 85 },
];

// Renk şeması
const colorScale = ['#ff4713', '#ff5722', '#ff6e40', '#FF9800', '#19B798', '#00cc9f', '#008c6b'];

const Reports = () => {
  const [timeFilter, setTimeFilter] = useState('year');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Renk skalası fonksiyonu - değer yükseldikçe daha iyi renk (yeşil) verir
  const getColorByPercentage = (percentage: number) => {
    if (percentage >= 90) return 'prometa.500';
    if (percentage >= 80) return 'prometa.400';
    if (percentage >= 70) return 'green.400';
    if (percentage >= 60) return 'yellow.400';
    if (percentage >= 50) return 'orange.400';
    return 'prometaOrange.500';
  };

  // Toplam görüşme sayısı
  const totalConversations = mockConversationData.reduce((acc, item) => acc + item.count, 0);
  
  // Ortalama tutundurma oranları
  const avgRetention3m = Math.round(mockConversationData.reduce((acc, item) => acc + item.retention3m, 0) / 12);
  const avgRetention6m = Math.round(mockConversationData.reduce((acc, item) => acc + item.retention6m, 0) / 12);
  const avgRetention12m = Math.round(mockConversationData.reduce((acc, item) => acc + item.retention12m, 0) / 12);
  
  // AI-Agent performansı
  const aiAgentPerformance = mockCampaignData.find(c => c.campaign === 'AI-Agent Hiper-Kişiselleştirme');
  const aiRetention3m = aiAgentPerformance?.retention3m || 0;
  const aiImpact = aiRetention3m - avgRetention3m;

  return (
    <Box>
      <Box 
        p={5} 
        borderRadius="lg" 
        bg={bgColor} 
        boxShadow="sm"
        bgGradient="linear(to-r, rgba(25, 183, 152, 0.1), rgba(255, 71, 19, 0.1))"
        mb={6}
      >
        <Heading 
          as="h1" 
          size="xl" 
          mb={2} 
          bgGradient="linear(to-r, prometa.600, prometaOrange.600)"
          bgClip="text"
        >
          Müşteri Tutundurma Raporları
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Görüşme sonuçları, kampanya etkinliği ve müşteri tutundurma oranları
        </Text>
      </Box>

      <Flex mb={6} justifyContent="flex-end">
        <Select 
          value={timeFilter} 
          onChange={(e) => setTimeFilter(e.target.value)} 
          width="200px"
          bg={bgColor}
          borderColor={borderColor}
        >
          <option value="year">Son 12 Ay</option>
          <option value="6months">Son 6 Ay</option>
          <option value="3months">Son 3 Ay</option>
        </Select>
      </Flex>

      {/* Özet İstatistikler */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
          <Stat>
            <StatLabel fontSize="md">Toplam Görüşme</StatLabel>
            <StatNumber fontSize="3xl" color="prometaOrange.500">{totalConversations}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              23% artış
            </StatHelpText>
          </Stat>
        </Box>

        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
          <Stat>
            <StatLabel fontSize="md">3-Aylık Tutundurma</StatLabel>
            <StatNumber fontSize="3xl" color={getColorByPercentage(avgRetention3m)}>%{avgRetention3m}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              5% artış
            </StatHelpText>
          </Stat>
        </Box>

        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
          <Stat>
            <StatLabel fontSize="md">6-Aylık Tutundurma</StatLabel>
            <StatNumber fontSize="3xl" color={getColorByPercentage(avgRetention6m)}>%{avgRetention6m}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              3% artış
            </StatHelpText>
          </Stat>
        </Box>

        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
          <Stat>
            <StatLabel fontSize="md">12-Aylık Tutundurma</StatLabel>
            <StatNumber fontSize="3xl" color={getColorByPercentage(avgRetention12m)}>%{avgRetention12m}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              7% artış
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* AI-Agent Etkisi */}
      <Box 
        p={5} 
        shadow="md" 
        borderWidth="1px" 
        borderRadius="lg" 
        bg={bgColor} 
        mb={8}
        bgGradient="linear(to-r, rgba(25, 183, 152, 0.05), rgba(25, 183, 152, 0.2))"
      >
        <Heading size="md" mb={4} color="prometa.700">
          AI-Agent Etkisi
        </Heading>
        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
          <GridItem>
            <Stat>
              <StatLabel>AI-Agent 3-Aylık Tutundurma</StatLabel>
              <StatNumber fontSize="2xl" color="prometa.600">%{aiRetention3m}</StatNumber>
              <Text mt={2} fontSize="sm">
                Ortalama tutundurma oranına göre <Badge colorScheme="green">+{aiImpact}%</Badge> iyileştirme
              </Text>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel>Kişiselleştirilmiş Teklifler</StatLabel>
              <StatNumber fontSize="2xl" color="prometa.600">{aiAgentPerformance?.count || 0}</StatNumber>
              <Text mt={2} fontSize="sm">
                Toplam görüşmelerin <Badge colorScheme="green">{Math.round((aiAgentPerformance?.count || 0) / totalConversations * 100)}%</Badge>'i
              </Text>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel>Tahmini Gelir Etkisi</StatLabel>
              <StatNumber fontSize="2xl" color="prometa.600">₺1.2M</StatNumber>
              <Text mt={2} fontSize="sm">
                İyileştirilmiş tutundurma sayesinde <Badge colorScheme="green">+18%</Badge> artış
              </Text>
            </Stat>
          </GridItem>
        </Grid>
      </Box>

      {/* Detaylı Raporlar */}
      <Tabs variant="enclosed" colorScheme="prometa" bg={bgColor} borderRadius="lg" p={2}>
        <TabList>
          <Tab>Aylık Tutundurma</Tab>
          <Tab>Kampanya Etkinliği</Tab>
          <Tab>Müşteri Segmenti</Tab>
        </TabList>

        <TabPanels>
          {/* Aylık Tutundurma Raporu */}
          <TabPanel>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Ay</Th>
                    <Th isNumeric>Görüşme Sayısı</Th>
                    <Th isNumeric>3-Aylık Tutundurma</Th>
                    <Th isNumeric>6-Aylık Tutundurma</Th>
                    <Th isNumeric>12-Aylık Tutundurma</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mockConversationData.slice().reverse().map((item, idx) => (
                    <Tr key={idx}>
                      <Td>{item.month}</Td>
                      <Td isNumeric>{item.count}</Td>
                      <Td isNumeric>
                        <Badge colorScheme={item.retention3m >= 85 ? "green" : item.retention3m >= 75 ? "yellow" : "red"}>
                          %{item.retention3m}
                        </Badge>
                      </Td>
                      <Td isNumeric>
                        <Badge colorScheme={item.retention6m >= 75 ? "green" : item.retention6m >= 65 ? "yellow" : "red"}>
                          %{item.retention6m}
                        </Badge>
                      </Td>
                      <Td isNumeric>
                        <Badge colorScheme={item.retention12m >= 65 ? "green" : item.retention12m >= 55 ? "yellow" : "red"}>
                          %{item.retention12m}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          {/* Kampanya Etkinliği Raporu */}
          <TabPanel>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Kampanya</Th>
                    <Th isNumeric>Görüşme Sayısı</Th>
                    <Th isNumeric>3-Aylık Tutundurma</Th>
                    <Th isNumeric>6-Aylık Tutundurma</Th>
                    <Th isNumeric>12-Aylık Tutundurma</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mockCampaignData.sort((a, b) => b.retention3m - a.retention3m).map((item, idx) => (
                    <Tr key={idx} bg={item.campaign === 'AI-Agent Hiper-Kişiselleştirme' ? 'prometa.50' : undefined}>
                      <Td fontWeight={item.campaign === 'AI-Agent Hiper-Kişiselleştirme' ? 'bold' : 'normal'}>
                        {item.campaign === 'AI-Agent Hiper-Kişiselleştirme' ? '🤖 ' : ''}{item.campaign}
                      </Td>
                      <Td isNumeric>{item.count}</Td>
                      <Td isNumeric>
                        <Badge colorScheme={item.retention3m >= 85 ? "green" : item.retention3m >= 75 ? "yellow" : "red"}>
                          %{item.retention3m}
                        </Badge>
                      </Td>
                      <Td isNumeric>
                        <Badge colorScheme={item.retention6m >= 75 ? "green" : item.retention6m >= 65 ? "yellow" : "red"}>
                          %{item.retention6m}
                        </Badge>
                      </Td>
                      <Td isNumeric>
                        <Badge colorScheme={item.retention12m >= 65 ? "green" : item.retention12m >= 55 ? "yellow" : "red"}>
                          %{item.retention12m}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          {/* Müşteri Segmenti Raporu */}
          <TabPanel>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Müşteri Segmenti</Th>
                    <Th isNumeric>Görüşme Sayısı</Th>
                    <Th isNumeric>3-Aylık Tutundurma</Th>
                    <Th isNumeric>6-Aylık Tutundurma</Th>
                    <Th isNumeric>12-Aylık Tutundurma</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mockSegmentData.sort((a, b) => b.retention3m - a.retention3m).map((item, idx) => (
                    <Tr key={idx}>
                      <Td>{item.segment}</Td>
                      <Td isNumeric>{item.count}</Td>
                      <Td isNumeric>
                        <Badge colorScheme={item.retention3m >= 85 ? "green" : item.retention3m >= 75 ? "yellow" : "red"}>
                          %{item.retention3m}
                        </Badge>
                      </Td>
                      <Td isNumeric>
                        <Badge colorScheme={item.retention6m >= 75 ? "green" : item.retention6m >= 65 ? "yellow" : "red"}>
                          %{item.retention6m}
                        </Badge>
                      </Td>
                      <Td isNumeric>
                        <Badge colorScheme={item.retention12m >= 65 ? "green" : item.retention12m >= 55 ? "yellow" : "red"}>
                          %{item.retention12m}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Reports; 