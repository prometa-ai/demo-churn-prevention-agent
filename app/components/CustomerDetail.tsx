'use client';

import { useState } from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Flex,
  Divider,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  List,
  ListItem,
  Progress,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Tag,
  TagLabel,
  Spinner,
  Select,
} from '@chakra-ui/react';
import { PhoneIcon, EmailIcon, InfoIcon, WarningIcon, CheckCircleIcon, SearchIcon } from '@chakra-ui/icons';
import { Customer } from '../models/Customer';
import ChatInterface from './ChatInterface';
import UsageChart from './UsageChart';

// Add a new interface to include the bill increase rate property
interface CustomerWithBillIncrease extends Customer {
  billIncreaseRate?: number;
}

interface CustomerDetailProps {
  customer: CustomerWithBillIncrease;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Function to determine badge color based on churn probability
  const getChurnBadgeColor = (probability: number): string => {
    if (probability < 0.3) return 'green';
    if (probability < 0.7) return 'yellow';
    return 'red';
  };

  // Function to format churn probability as percentage
  const formatChurnProbability = (probability: number): string => {
    return `${Math.round(probability * 100)}%`;
  };
  
  // Function to determine payment status badge color
  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'yellow';
      case 'overdue': return 'red';
      default: return 'gray';
    }
  };
  
  // Function to determine payment status icon
  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon />;
      case 'pending': return <InfoIcon />;
      case 'overdue': return <WarningIcon />;
      default: return null;
    }
  };

  // Function to translate payment status
  const translatePaymentStatus = (status: string): string => {
    switch (status) {
      case 'paid': return 'Ödendi';
      case 'pending': return 'Beklemede';
      case 'overdue': return 'Gecikmiş';
      default: return status;
    }
  };

  // Function to translate ticket status
  const translateTicketStatus = (status: string): string => {
    switch (status) {
      case 'open': return 'Açık';
      case 'closed': return 'Kapalı';
      case 'pending': return 'Beklemede';
      default: return status;
    }
  };
  
  // Calculate usage percentages
  const dataUsagePercent = (customer.usage.dataUsage.current / customer.usage.dataUsage.limit) * 100;
  const callUsagePercent = (customer.usage.callUsage.current / customer.usage.callUsage.limit) * 100;
  const textUsagePercent = (customer.usage.textUsage.current / customer.usage.textUsage.limit) * 100;
  
  // Calculate bill increase percentage if it's not already calculated
  const billIncreasePercent = customer.billIncreaseRate !== undefined ? 
    customer.billIncreaseRate : 
    customer.billing.paymentHistory.length > 1 ? 
      ((customer.billing.currentBill - customer.billing.paymentHistory[1].amount) / customer.billing.paymentHistory[1].amount) * 100 : 
      0;
  
  // Function to get color for bill increase
  const getBillIncreaseColor = (percent: number): string => {
    if (percent < 0) return 'green.500';
    if (percent < 10) return 'yellow.500';
    if (percent < 25) return 'orange.500';
    return 'red.500';
  };
  
  // Background colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Calculate churn risk factors from support history and satisfaction
  const calculateChurnRiskFromSupport = () => {
    const ticketsOpened = customer.customerService.ticketsOpened;
    const unresolvedTickets = customer.customerService.ticketHistory.filter(
      t => t.status === 'open' || t.status === 'pending'
    ).length;
    
    const satisfaction = customer.customerService.averageSatisfaction;
    
    // Count recent tickets (within the last 3 months)
    const recentTickets = customer.customerService.ticketHistory.filter(t => {
      const ticketDate = new Date(t.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return ticketDate >= threeMonthsAgo;
    }).length;
    
    // Determine the risk level based on tickets, unresolved tickets, and satisfaction
    if (ticketsOpened > 3 || unresolvedTickets > 1 || satisfaction < 2.5) {
      return {
        level: 'high',
        reason: satisfaction < 2.5 
          ? 'Düşük memnuniyet puanları müşteri kaybı riskini artırıyor' 
          : ticketsOpened > 3 
            ? 'Yüksek sayıda destek talebi müşteri kaybı göstergesi' 
            : 'Çözülmemiş destek talepleri müşteriyi kaybetme riskini artırıyor',
        ticketCount: ticketsOpened,
        unresolvedCount: unresolvedTickets,
        recentTickets: recentTickets,
        isSignificant: true
      };
    } else if (ticketsOpened > 1 || satisfaction < 3.5) {
      return {
        level: 'medium',
        reason: satisfaction < 3.5 
          ? 'Ortalama memnuniyet puanları iyileştirme gerektiriyor' 
          : 'Birden fazla destek talebi takip gerektiriyor',
        ticketCount: ticketsOpened,
        unresolvedCount: unresolvedTickets,
        recentTickets: recentTickets,
        isSignificant: ticketsOpened > 2 || unresolvedTickets > 0
      };
    } else {
      return {
        level: 'low',
        reason: satisfaction >= 4 
          ? 'Yüksek memnuniyet puanları müşteri sadakatini gösteriyor' 
          : 'Az sayıda destek talebi olumlu müşteri deneyimini gösteriyor',
        ticketCount: ticketsOpened,
        unresolvedCount: unresolvedTickets,
        recentTickets: recentTickets,
        isSignificant: false
      };
    }
  };
  
  // Function to get color based on satisfaction rating
  const getSatisfactionColor = (rating: number): string => {
    if (rating >= 4.5) return 'green.600';
    if (rating >= 4) return 'green.500';
    if (rating >= 3.5) return 'green.400';
    if (rating >= 3) return 'yellow.400';
    if (rating >= 2.5) return 'yellow.500';
    if (rating >= 2) return 'orange.500';
    return 'red.500';
  };
  
  // Function to get satisfaction level text
  const getSatisfactionText = (rating: number): string => {
    if (rating >= 4.5) return 'Çok Memnun';
    if (rating >= 4) return 'Memnun';
    if (rating >= 3.5) return 'Genellikle Memnun';
    if (rating >= 3) return 'Kararsız';
    if (rating >= 2.5) return 'Kısmen Memnuniyetsiz';
    if (rating >= 2) return 'Memnuniyetsiz';
    return 'Çok Memnuniyetsiz';
  };
  
  const supportRiskFactor = calculateChurnRiskFromSupport();
  
  return (
    <Box bg={bgColor} borderRadius="md" boxShadow="sm" p={5}>
      {/* Customer Header */}
      <Grid templateColumns="repeat(12, 1fr)" gap={4} mb={4}>
        <GridItem colSpan={{ base: 12, md: 8 }}>
          <Heading size="lg">{customer.name}</Heading>
          <Flex mt={2} gap={4}>
            <Flex align="center">
              <PhoneIcon mr={2} color="blue.500" />
              <Text>{customer.phoneNumber}</Text>
            </Flex>
            <Flex align="center">
              <EmailIcon mr={2} color="blue.500" />
              <Text>{customer.email}</Text>
            </Flex>
          </Flex>
          <Text mt={2} color="gray.600">
            Hesap: {customer.accountNumber} | Müşteri Tarihi: {customer.customerSince}
          </Text>
        </GridItem>
      </Grid>
      
      <Box mb={6} p={4} borderWidth="1px" borderRadius="md" borderColor={getChurnBadgeColor(customer.churnProbability) === 'red' ? 'red.200' : (getChurnBadgeColor(customer.churnProbability) === 'yellow' ? 'yellow.200' : 'green.200')}>
        <Flex justify="space-between" align="center">
          <Heading size="md" mb={2}>Ayrılma Riski</Heading>
          <Badge 
            colorScheme={getChurnBadgeColor(customer.churnProbability)}
            fontSize="md"
            py={1}
            px={3}
            borderRadius="full"
          >
            {formatChurnProbability(customer.churnProbability)}
          </Badge>
        </Flex>
        
        <Progress 
          value={customer.churnProbability * 100} 
          colorScheme={getChurnBadgeColor(customer.churnProbability)}
          borderRadius="full"
          size="sm"
          mt={2}
          mb={3}
        />
        
        <Alert 
          status={supportRiskFactor.level === 'high' ? 'error' : (supportRiskFactor.level === 'medium' ? 'warning' : 'info')} 
          borderRadius="md" 
          mt={2}
          variant={supportRiskFactor.isSignificant ? 'solid' : 'subtle'}
        >
          <AlertIcon />
          <Box>
            <AlertTitle>Destek ve Memnuniyet Risk Faktörü</AlertTitle>
            <AlertDescription>
              {supportRiskFactor.reason}. 
              {supportRiskFactor.ticketCount > 0 ? (
                <Text as="span" fontWeight={supportRiskFactor.ticketCount > 3 ? "bold" : "normal"}>
                  {' '}Toplam <Text as="span" color={supportRiskFactor.ticketCount > 3 ? "white" : "inherit"} fontWeight="bold">{supportRiskFactor.ticketCount}</Text> destek talebi
                  {supportRiskFactor.unresolvedCount > 0 ? `, bunların ${supportRiskFactor.unresolvedCount} tanesi çözülmemiş` : ''}
                  {supportRiskFactor.recentTickets > 0 ? ` ve ${supportRiskFactor.recentTickets} tanesi son 3 ayda açılmış` : ''}.
                </Text>
              ) : ' Henüz destek talebi bulunmamaktadır.'}
              {' '}Ortalama memnuniyet puanı <Text as="span" fontWeight="bold" color={customer.customerService.averageSatisfaction < 3 ? (supportRiskFactor.level === 'high' ? "white" : "red.500") : "inherit"}>{customer.customerService.averageSatisfaction.toFixed(1)}/5</Text> ({getSatisfactionText(customer.customerService.averageSatisfaction)}).
            </AlertDescription>
            {(customer.churnProbability > 0.7 && (supportRiskFactor.ticketCount > 3 || customer.customerService.averageSatisfaction < 3)) && (
              <Text mt={2} fontWeight="bold" color="white">
                ⚠️ Ayrılma riski yüksek müşterilerde çok sayıda destek talebi ve düşük memnuniyet puanları görülmektedir. Acil müdahale gerekebilir.
              </Text>
            )}
          </Box>
        </Alert>
      </Box>
      
      {/* Add Key Metrics Box */}
      <Box mb={6} p={4} borderWidth="1px" borderRadius="md" borderColor="blue.200" bg="blue.50">
        <Heading size="md" mb={3}>Önemli Metrikler</Heading>
        <Grid templateColumns="repeat(12, 1fr)" gap={4}>
          <GridItem colSpan={{ base: 6, md: 3 }}>
            <Box p={3} bg="white" borderRadius="md" boxShadow="sm">
              <Text fontSize="sm" color="gray.600">Veri Kullanım Oranı</Text>
              <Flex align="center" justify="space-between">
                <Text fontSize="xl" fontWeight="bold" color={dataUsagePercent > 90 ? 'red.500' : (dataUsagePercent > 75 ? 'orange.500' : 'blue.500')}>
                  {dataUsagePercent.toFixed(0)}%
                </Text>
                <Badge colorScheme={dataUsagePercent > 90 ? 'red' : (dataUsagePercent > 75 ? 'orange' : 'blue')}>
                  {dataUsagePercent > 90 ? 'Kritik' : (dataUsagePercent > 75 ? 'Yüksek' : 'Normal')}
                </Badge>
              </Flex>
              <Text fontSize="xs" mt={1} color="gray.500">
                {customer.usage.dataUsage.current}GB / {customer.usage.dataUsage.limit}GB
              </Text>
            </Box>
          </GridItem>
          
          <GridItem colSpan={{ base: 6, md: 3 }}>
            <Box p={3} bg="white" borderRadius="md" boxShadow="sm">
              <Text fontSize="sm" color="gray.600">Fatura Değişimi</Text>
              <Flex align="center" justify="space-between">
                <Text fontSize="xl" fontWeight="bold" color={getBillIncreaseColor(billIncreasePercent)}>
                  {billIncreasePercent > 0 ? '+' : ''}{billIncreasePercent.toFixed(1)}%
                </Text>
                <Badge colorScheme={billIncreasePercent < 0 ? 'green' : (billIncreasePercent < 10 ? 'yellow' : (billIncreasePercent < 25 ? 'orange' : 'red'))}>
                  {billIncreasePercent < 0 ? 'Azalma' : (billIncreasePercent < 10 ? 'Normal' : (billIncreasePercent < 25 ? 'Artış' : 'Yüksek Artış'))}
                </Badge>
              </Flex>
              <Text fontSize="xs" mt={1} color="gray.500">
                Önceki Ay: {customer.billing.paymentHistory.length > 1 ? `${customer.billing.paymentHistory[1].amount.toFixed(2)}₺` : 'Veri yok'}
              </Text>
            </Box>
          </GridItem>
          
          <GridItem colSpan={{ base: 6, md: 3 }}>
            <Box p={3} bg="white" borderRadius="md" boxShadow="sm">
              <Text fontSize="sm" color="gray.600">Aktif Destek Talepleri</Text>
              <Flex align="center" justify="space-between">
                <Text fontSize="xl" fontWeight="bold" color={customer.customerService.ticketHistory.filter(t => t.status !== 'closed').length > 0 ? 'orange.500' : 'green.500'}>
                  {customer.customerService.ticketHistory.filter(t => t.status !== 'closed').length}
                </Text>
                <Badge colorScheme={customer.customerService.ticketHistory.filter(t => t.status !== 'closed').length > 0 ? 'orange' : 'green'}>
                  {customer.customerService.ticketHistory.filter(t => t.status !== 'closed').length > 0 ? 'Beklemede' : 'Kapalı'}
                </Badge>
              </Flex>
              <Text fontSize="xs" mt={1} color="gray.500">
                Toplam: {customer.customerService.ticketsOpened} talep
              </Text>
            </Box>
          </GridItem>
          
          <GridItem colSpan={{ base: 6, md: 3 }}>
            <Box p={3} bg="white" borderRadius="md" boxShadow="sm">
              <Text fontSize="sm" color="gray.600">Memnuniyet Puanı</Text>
              <Flex align="center" justify="space-between">
                <Text fontSize="xl" fontWeight="bold" color={getSatisfactionColor(customer.customerService.averageSatisfaction)}>
                  {customer.customerService.averageSatisfaction.toFixed(1)}
                </Text>
                <Badge colorScheme={customer.customerService.averageSatisfaction >= 4 ? 'green' : (customer.customerService.averageSatisfaction >= 3 ? 'yellow' : 'red')}>
                  {getSatisfactionText(customer.customerService.averageSatisfaction)}
                </Badge>
              </Flex>
              <Text fontSize="xs" mt={1} color="gray.500">
                Ölçek: 1-5
              </Text>
            </Box>
          </GridItem>
        </Grid>
      </Box>
      
      <Tabs variant="enclosed" onChange={(index) => setActiveTab(index)} index={activeTab}>
        <TabList>
          <Tab>Genel Bakış</Tab>
          <Tab>Faturalama</Tab>
          <Tab>Kullanım</Tab>
          <Tab>Destek Geçmişi</Tab>
          <Tab>Sohbet</Tab>
        </TabList>
        
        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <Grid templateColumns="repeat(12, 1fr)" gap={6}>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Box 
                  p={4} 
                  borderRadius="md" 
                  borderWidth="1px"
                  borderColor={borderColor}
                  height="100%"
                >
                  <Heading size="md" mb={4}>Paket Detayları</Heading>
                  <Stat mb={4}>
                    <StatLabel>Mevcut Paket</StatLabel>
                    <StatNumber>{customer.plan.name}</StatNumber>
                    <StatHelpText>{customer.plan.monthlyCost.toFixed(2)}₺/ay</StatHelpText>
                  </Stat>
                  
                  <Divider my={4} />
                  
                  <Text fontWeight="medium" mb={2}>Paket Özellikleri:</Text>
                  <List spacing={2}>
                    <ListItem>Veri: {customer.plan.dataLimit} GB</ListItem>
                    <ListItem>Arama Dakikaları: {customer.plan.callMinutes}</ListItem>
                    <ListItem>Mesajlar: {customer.plan.textMessages}</ListItem>
                    {customer.plan.features.map((feature, index) => (
                      <ListItem key={index}>✓ {feature}</ListItem>
                    ))}
                  </List>
                </Box>
              </GridItem>
              
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Box 
                  p={4} 
                  borderRadius="md" 
                  borderWidth="1px"
                  borderColor={borderColor}
                  height="100%"
                >
                  <Heading size="md" mb={4}>Mevcut Kullanım</Heading>
                  
                  <Text fontWeight="medium" mb={2}>Veri Kullanımı</Text>
                  <Flex justify="space-between" mb={1}>
                    <Text>{customer.usage.dataUsage.current} GB</Text>
                    <Text>{customer.usage.dataUsage.limit} GB</Text>
                  </Flex>
                  <Progress 
                    value={dataUsagePercent} 
                    colorScheme={dataUsagePercent > 90 ? 'red' : 'blue'}
                    mb={4}
                    borderRadius="full"
                  />
                  
                  <Text fontWeight="medium" mb={2}>Arama Dakikaları</Text>
                  <Flex justify="space-between" mb={1}>
                    <Text>{customer.usage.callUsage.current}</Text>
                    <Text>{customer.usage.callUsage.limit}</Text>
                  </Flex>
                  <Progress 
                    value={callUsagePercent} 
                    colorScheme={callUsagePercent > 90 ? 'red' : 'blue'}
                    mb={4}
                    borderRadius="full"
                  />
                  
                  <Text fontWeight="medium" mb={2}>Mesajlar</Text>
                  <Flex justify="space-between" mb={1}>
                    <Text>{customer.usage.textUsage.current}</Text>
                    <Text>{customer.usage.textUsage.limit}</Text>
                  </Flex>
                  <Progress 
                    value={textUsagePercent} 
                    colorScheme={textUsagePercent > 90 ? 'red' : 'blue'}
                    borderRadius="full"
                  />
                </Box>
              </GridItem>
              
              <GridItem colSpan={12}>
                <Box 
                  p={4} 
                  borderRadius="md" 
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Heading size="md" mb={4}>Müşteri Notları</Heading>
                  {customer.notes.length > 0 ? (
                    <List spacing={2}>
                      {customer.notes.map((note, index) => (
                        <ListItem key={index} p={2} bg="gray.50" borderRadius="md">
                          {note}
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Text color="gray.500">Not bulunamadı</Text>
                  )}
                </Box>
              </GridItem>
            </Grid>
          </TabPanel>
          
          {/* Billing Tab */}
          <TabPanel>
            <Grid templateColumns="repeat(12, 1fr)" gap={6}>
              <GridItem colSpan={{ base: 12, md: 4 }}>
                <Box 
                  p={4} 
                  borderRadius="md" 
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Heading size="md" mb={4}>Mevcut Fatura</Heading>
                  <Stat mb={2}>
                    <StatLabel>Ödenecek Tutar</StatLabel>
                    <StatNumber>{customer.billing.currentBill.toFixed(2)}₺</StatNumber>
                    <StatHelpText>Son Ödeme Tarihi: {customer.billing.dueDate}</StatHelpText>
                  </Stat>
                  
                  <Flex align="center" mt={4}>
                    <Badge 
                      colorScheme={getPaymentStatusColor(customer.billing.paymentStatus)}
                      px={2}
                      py={1}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                    >
                      {getPaymentStatusIcon(customer.billing.paymentStatus)}
                      <Text ml={1} textTransform="capitalize">{translatePaymentStatus(customer.billing.paymentStatus)}</Text>
                    </Badge>
                  </Flex>
                  
                  <Button colorScheme="blue" size="sm" mt={4} width="100%">
                    Faturayı Görüntüle
                  </Button>
                </Box>
              </GridItem>
              
              <GridItem colSpan={{ base: 12, md: 8 }}>
                <Box 
                  p={4} 
                  borderRadius="md" 
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Heading size="md" mb={4}>Ödeme Geçmişi</Heading>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Tarih</Th>
                        <Th>Tutar</Th>
                        <Th>Durum</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {customer.billing.paymentHistory.map((payment, index) => (
                        <Tr key={index}>
                          <Td>{payment.date}</Td>
                          <Td>{payment.amount.toFixed(2)}₺</Td>
                          <Td>
                            <Badge colorScheme={getPaymentStatusColor(payment.status)}>
                              {translatePaymentStatus(payment.status)}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </GridItem>
            </Grid>
          </TabPanel>
          
          {/* Usage Tab */}
          <TabPanel>
            <Grid templateColumns="repeat(12, 1fr)" gap={6}>
              <GridItem colSpan={12}>
                <Box 
                  p={4} 
                  borderRadius="md" 
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Heading size="md" mb={4}>Kullanım Eğilimleri</Heading>
                  <UsageChart customer={customer} />
                </Box>
              </GridItem>
            </Grid>
          </TabPanel>
          
          {/* Support History Tab */}
          <TabPanel>
            <Box 
              p={4} 
              borderRadius="md" 
              borderWidth="1px"
              borderColor={borderColor}
              mb={4}
              bg="blue.50"
            >
              <Heading size="md" mb={3} color="blue.700">Hızlı İstatistiksel İçgörü</Heading>
              <Text fontWeight="medium" color="blue.700" mb={3}>
                Analizlerimize göre ayrılma olasılığı ile destek talepleri ve memnuniyet puanları arasında güçlü bir ilişki bulunmaktadır:
              </Text>
              <Flex gap={4} flexWrap="wrap">
                <Box bg="white" p={3} borderRadius="md" flex="1" minW="250px" boxShadow="sm">
                  <Heading size="sm" color="red.600" mb={2}>Yüksek Destek Talebi</Heading>
                  <Text fontSize="sm">6 ay içinde 3'ten fazla destek talebi oluşturan müşterilerin <Text as="span" fontWeight="bold">%74'ü</Text> rakip operatörlere geçmeyi değerlendirmektedir.</Text>
                </Box>
                <Box bg="white" p={3} borderRadius="md" flex="1" minW="250px" boxShadow="sm">
                  <Heading size="sm" color="red.600" mb={2}>Düşük Memnuniyet Puanları</Heading>
                  <Text fontSize="sm">Memnuniyet puanı 3'ün altında olan müşterilerin <Text as="span" fontWeight="bold">%62'si</Text> 6 ay içinde hizmeti sonlandırmaktadır.</Text>
                </Box>
                <Box bg="white" p={3} borderRadius="md" flex="1" minW="250px" boxShadow="sm">
                  <Heading size="sm" color="red.600" mb={2}>Birleşik Etki</Heading>
                  <Text fontSize="sm">Hem yüksek destek talebi hem de düşük memnuniyet puanları olan müşterilerde ayrılma riski <Text as="span" fontWeight="bold">%85</Text> artmaktadır.</Text>
                </Box>
              </Flex>
            </Box>
            
            <Box 
              p={4} 
              borderRadius="md" 
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Destek Talepleri</Heading>
                <HStack spacing={4}>
                  <Badge 
                    colorScheme={customer.customerService.ticketsOpened > 3 ? 'red' : (customer.customerService.ticketsOpened > 1 ? 'yellow' : 'green')} 
                    fontSize="md" 
                    borderRadius="full" 
                    px={2}
                  >
                    {customer.customerService.ticketsOpened} Talep
                  </Badge>
                  <Flex align="center" bg={getSatisfactionColor(customer.customerService.averageSatisfaction)} px={3} py={1} borderRadius="full" color="white">
                    <Text fontWeight="bold" mr={1}>{customer.customerService.averageSatisfaction.toFixed(1)}</Text>
                    <Text fontSize="sm">/5</Text>
                  </Flex>
                </HStack>
              </Flex>
              
              <Text mb={4}>Son İletişim: {customer.customerService.lastContact}</Text>
              
              {customer.churnProbability > 0.7 && customer.customerService.ticketsOpened > 3 && customer.customerService.averageSatisfaction < 3.5 && (
                <Alert status="error" mb={4} borderRadius="md" variant="solid">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontWeight="bold">Yüksek Ayrılma Riski Tespiti</AlertTitle>
                    <AlertDescription>
                      Bu müşteri yüksek ayrılma riski taşımaktadır. Destek geçmişinde {customer.customerService.ticketsOpened} kayıt bulunmakta ve memnuniyet puanı ortalamanın oldukça altındadır ({customer.customerService.averageSatisfaction.toFixed(1)}/5). Araştırmalarımız, destek taleplerinin yüksek sayıda olduğu ve memnuniyet puanlarının düşük olduğu müşterilerin ayrılma olasılığının %85 daha yüksek olduğunu göstermektedir.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              
              <Box mb={4} p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
                <Heading size="sm" mb={2}>Memnuniyet Analizi</Heading>
                <Text mb={2}>
                  Ortalama Memnuniyet: <Text as="span" fontWeight="bold" color={getSatisfactionColor(customer.customerService.averageSatisfaction)}>{customer.customerService.averageSatisfaction.toFixed(1)}</Text>
                  <Text as="span" ml={1} fontSize="sm">({getSatisfactionText(customer.customerService.averageSatisfaction)})</Text>
                </Text>
                
                {customer.customerService.averageSatisfaction < 3 ? (
                  <Text fontSize="sm" p={2} bg="red.50" color="red.700" borderRadius="md" fontWeight="medium">
                    Düşük memnuniyet puanları ayrılma riskini önemli ölçüde arttırır. İstatistiklerimize göre, memnuniyet puanı 3'ün altında olan müşterilerin %62'si 6 ay içinde hizmeti sonlandırmaktadır. Müşteri ile proaktif iletişime geçilmesi önerilir.
                  </Text>
                ) : customer.customerService.averageSatisfaction >= 4 ? (
                  <Text fontSize="sm" color="green.600">
                    Yüksek memnuniyet puanları müşteri sadakatini arttırır ve ayrılma riskini azaltır.
                  </Text>
                ) : (
                  <Text fontSize="sm" color="orange.600">
                    Ortalama memnuniyet puanları iyileştirme fırsatı sunar. Müşteri deneyiminin geliştirilmesi önerilir.
                  </Text>
                )}
              </Box>
              
              {customer.customerService.ticketsOpened > 3 && (
                <Box mb={4} p={3} borderWidth="1px" borderRadius="md" bg="red.50" borderColor="red.200">
                  <Heading size="sm" mb={2} color="red.700">Yüksek Destek Talebi Analizi</Heading>
                  <Text fontSize="sm" color="red.700">
                    Bu müşteri, son {customer.customerService.ticketHistory.filter(t => {
                      const ticketDate = new Date(t.date);
                      const sixMonthsAgo = new Date();
                      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                      return ticketDate >= sixMonthsAgo;
                    }).length} tanesi son 6 ayda olmak üzere toplam {customer.customerService.ticketsOpened} destek talebi oluşturmuştur. Müşteriler arasında yaptığımız analizlere göre, 6 aylık sürede 3'ten fazla destek talebi oluşturan müşterilerin %74'ü rakip operatörlere geçmeyi değerlendirmektedir.
                  </Text>
                </Box>
              )}
              
              {supportRiskFactor.level !== 'low' && (
                <Alert status={supportRiskFactor.level === 'high' ? 'error' : 'warning'} mb={4} borderRadius="md" variant={supportRiskFactor.level === 'high' ? 'solid' : 'subtle'}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Destek taleplerinden kaynaklanan ayrılma riski</AlertTitle>
                    <AlertDescription>
                      {supportRiskFactor.reason} ({supportRiskFactor.ticketCount} destek talebi, {supportRiskFactor.unresolvedCount} çözülmemiş)
                      {supportRiskFactor.level === 'high' && (
                        <Text mt={2} fontWeight="bold">
                          Çok sayıda destek talebi ve düşük memnuniyet puanları, ayrılma riskini %70 oranında artırmaktadır.
                        </Text>
                      )}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              
              {customer.customerService.ticketHistory.length > 0 ? (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Tarih</Th>
                      <Th>Konu</Th>
                      <Th>Durum</Th>
                      <Th>Çözüm</Th>
                      <Th>Memnuniyet</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {customer.customerService.ticketHistory.map((ticket, index) => (
                      <Tr key={index} bg={ticket.satisfactionRating && ticket.satisfactionRating < 3 ? "red.50" : undefined}>
                        <Td>{ticket.date}</Td>
                        <Td>{ticket.issue}</Td>
                        <Td>
                          <Badge 
                            colorScheme={
                              ticket.status === 'open' ? 'red' : 
                              ticket.status === 'pending' ? 'yellow' : 'green'
                            }
                          >
                            {translateTicketStatus(ticket.status)}
                          </Badge>
                        </Td>
                        <Td>{ticket.resolution || '-'}</Td>
                        <Td>
                          {ticket.satisfactionRating ? (
                            <Flex align="center">
                              <Text 
                                fontWeight={ticket.satisfactionRating < 3 ? "bold" : "normal"} 
                                color={getSatisfactionColor(ticket.satisfactionRating)}
                              >
                                {ticket.satisfactionRating}
                              </Text>
                              <Text color="gray.500" ml={1}>/5</Text>
                              {ticket.satisfactionRating < 3 && (
                                <Badge ml={2} colorScheme="red" size="sm">Düşük</Badge>
                              )}
                            </Flex>
                          ) : (
                            <Text color="gray.500">-</Text>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Text color="gray.500">Destek talebi bulunamadı</Text>
              )}
            </Box>
          </TabPanel>
          
          {/* Chat Tab */}
          <TabPanel>
            <Box>
              <ChatInterface customer={customer} />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CustomerDetail; 