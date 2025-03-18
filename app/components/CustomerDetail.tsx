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
} from '@chakra-ui/react';
import { PhoneIcon, EmailIcon, InfoIcon, WarningIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { Customer } from '../models/Customer';
import ChatInterface from './ChatInterface';
import UsageChart from './UsageChart';

interface CustomerDetailProps {
  customer: Customer;
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
    
    // Determine the risk level based on tickets and satisfaction
    if (ticketsOpened > 3 || satisfaction < 2.5) {
      return {
        level: 'high',
        reason: satisfaction < 2.5 
          ? 'Düşük memnuniyet puanları' 
          : 'Yüksek sayıda destek talebi'
      };
    } else if (ticketsOpened > 1 || satisfaction < 3.5) {
      return {
        level: 'medium',
        reason: satisfaction < 3.5 
          ? 'Ortalama memnuniyet puanları' 
          : 'Birden fazla destek talebi'
      };
    } else {
      return {
        level: 'low',
        reason: satisfaction >= 4 
          ? 'Yüksek memnuniyet puanları' 
          : 'Az sayıda destek talebi'
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
        
        <Alert status={supportRiskFactor.level === 'high' ? 'error' : (supportRiskFactor.level === 'medium' ? 'warning' : 'info')} borderRadius="md" mt={2}>
          <AlertIcon />
          <Box>
            <AlertTitle>Destek ve Memnuniyet Risk Faktörü</AlertTitle>
            <AlertDescription>
              {supportRiskFactor.reason}. {customer.customerService.ticketsOpened} destek talebi, ortalama memnuniyet puanı {customer.customerService.averageSatisfaction.toFixed(1)}/5 ({getSatisfactionText(customer.customerService.averageSatisfaction)}).
            </AlertDescription>
          </Box>
        </Alert>
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
              
              <Box mb={4} p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
                <Heading size="sm" mb={2}>Memnuniyet Analizi</Heading>
                <Text mb={2}>
                  Ortalama Memnuniyet: <Text as="span" fontWeight="bold" color={getSatisfactionColor(customer.customerService.averageSatisfaction)}>{customer.customerService.averageSatisfaction.toFixed(1)}</Text>
                  <Text as="span" ml={1} fontSize="sm">({getSatisfactionText(customer.customerService.averageSatisfaction)})</Text>
                </Text>
                
                <Text fontSize="sm" color="gray.600">
                  {customer.customerService.averageSatisfaction < 3 
                    ? 'Düşük memnuniyet puanları ayrılma riskini önemli ölçüde arttırır. Müşteri ile iletişime geçilmesi önerilir.'
                    : customer.customerService.averageSatisfaction >= 4 
                      ? 'Yüksek memnuniyet puanları müşteri sadakatini arttırır ve ayrılma riskini azaltır.'
                      : 'Ortalama memnuniyet puanları iyileştirme fırsatı sunar. Müşteri deneyiminin geliştirilmesi önerilir.'}
                </Text>
              </Box>
              
              {supportRiskFactor.level !== 'low' && (
                <Alert status={supportRiskFactor.level === 'high' ? 'error' : 'warning'} mb={4} borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Destek taleplerinden kaynaklanan ayrılma riski</AlertTitle>
                    <AlertDescription>
                      {supportRiskFactor.reason} ({customer.customerService.ticketsOpened} destek talebi, {customer.customerService.ticketHistory.filter(t => t.status === 'open' || t.status === 'pending').length} çözülmemiş)
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
                      <Tr key={index}>
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
                              <Text fontWeight="bold" color={getSatisfactionColor(ticket.satisfactionRating)}>{ticket.satisfactionRating}</Text>
                              <Text color="gray.500" ml={1}>/5</Text>
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
            <ChatInterface customer={customer} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CustomerDetail; 