'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  Badge,
  Button,
  useColorModeValue,
  HStack,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { SearchIcon, ChatIcon } from '@chakra-ui/icons';
import CustomerList from './CustomerList';
import CustomerDetail from './CustomerDetail';
import { Customer } from '../models/Customer';
import { generateMockCustomers } from '../data/mockData';

const CustomerDashboard = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('churnRisk');
  const [churnFilterValue, setChurnFilterValue] = useState([0, 100]);
  const [showTooltip, setShowTooltip] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    // Load mock customer data
    const mockCustomers = generateMockCustomers(100);
    setCustomers(mockCustomers);
    
    // Set the first customer as selected by default
    if (mockCustomers.length > 0) {
      setSelectedCustomer(mockCustomers[0]);
    }
  }, []);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleChurnFilterChange = (val: number[]) => {
    setChurnFilterValue(val);
  };

  const handleBulkCall = () => {
    onOpen();
  };

  // Apply both text and churn risk filters
  const filteredCustomers = customers.filter(customer => 
    (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     customer.phoneNumber.includes(searchTerm) ||
     customer.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (Math.round(customer.churnProbability * 100) >= churnFilterValue[0] &&
     Math.round(customer.churnProbability * 100) <= churnFilterValue[1])
  );

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'churnRisk') {
      return b.churnProbability - a.churnProbability;
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'billAmount') {
      return b.billing.currentBill - a.billing.currentBill;
    }
    return 0;
  });

  return (
    <Grid templateColumns="repeat(12, 1fr)" gap={6}>
      <GridItem colSpan={{ base: 12, md: 4 }}>
        <Box bg={bgColor} p={5} borderRadius="md" boxShadow="sm" height="100%">
          <Heading size="md" mb={4} color="prometa.700">
            Müşteriler
            <Badge ml={2} colorScheme="prometa" borderRadius="full" px={2}>
              {filteredCustomers.length}
            </Badge>
          </Heading>
          
          <Box mb={6}>
            <Text fontWeight="medium" fontSize="sm" mb={2}>
              Ayrılma Riski Filtreleme (%)
            </Text>
            <RangeSlider
              min={0}
              max={100}
              step={5}
              value={churnFilterValue}
              onChange={handleChurnFilterChange}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              mb={4}
              colorScheme="prometa"
            >
              <RangeSliderTrack>
                <RangeSliderFilledTrack />
              </RangeSliderTrack>
              <Tooltip
                hasArrow
                bg="prometa.500"
                color="white"
                placement="top"
                isOpen={showTooltip}
                label={`${churnFilterValue[0]}%`}
              >
                <RangeSliderThumb boxSize={6} index={0} />
              </Tooltip>
              <Tooltip
                hasArrow
                bg="prometa.500"
                color="white"
                placement="top"
                isOpen={showTooltip}
                label={`${churnFilterValue[1]}%`}
              >
                <RangeSliderThumb boxSize={6} index={1} />
              </Tooltip>
            </RangeSlider>
            <HStack spacing={2} fontSize="xs" color="gray.500" justifyContent="space-between">
              <Text>Düşük Risk</Text>
              <Text>Yüksek Risk</Text>
            </HStack>
          </Box>
          
          <Flex mb={4} gap={2}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="prometa.300" />
              </InputLeftElement>
              <Input 
                placeholder="Müşteri ara..." 
                value={searchTerm}
                onChange={handleSearch}
                borderColor={borderColor}
                _focus={{
                  borderColor: "prometa.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-prometa-500)",
                }}
              />
            </InputGroup>
            
            <Select 
              width="150px" 
              value={sortBy} 
              onChange={handleSortChange}
              borderColor={borderColor}
              _focus={{
                borderColor: "prometa.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-prometa-500)",
              }}
            >
              <option value="churnRisk">Ayrılma Riski</option>
              <option value="name">İsim</option>
              <option value="billAmount">Fatura Tutarı</option>
            </Select>
          </Flex>
          
          {filteredCustomers.length > 0 && (
            <Button
              leftIcon={<ChatIcon />}
              colorScheme="prometa"
              size="sm"
              width="100%"
              mb={4}
              onClick={handleBulkCall}
            >
              Toplu Görüşme Başlat ({filteredCustomers.length})
            </Button>
          )}
          
          <CustomerList 
            customers={sortedCustomers} 
            selectedCustomerId={selectedCustomer?.id || ''} 
            onSelectCustomer={handleCustomerSelect} 
          />
        </Box>
      </GridItem>
      
      <GridItem colSpan={{ base: 12, md: 8 }}>
        {selectedCustomer ? (
          <CustomerDetail customer={selectedCustomer} />
        ) : (
          <Box bg={bgColor} p={10} borderRadius="md" boxShadow="sm" textAlign="center">
            <Text>Detayları görmek için bir müşteri seçin</Text>
          </Box>
        )}
      </GridItem>

      {/* Toplu Görüşme Modal Penceresi */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="prometa.600">
            Toplu Görüşme Başlat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4}>
              Aşağıdaki <strong>{filteredCustomers.length}</strong> müşteri ile toplu görüşme başlatılacak:
            </Text>
            <Box maxH="200px" overflowY="auto" borderWidth="1px" borderRadius="md" p={2}>
              {filteredCustomers.map((customer, index) => (
                <Flex key={customer.id} justify="space-between" py={1} borderBottomWidth={index < filteredCustomers.length - 1 ? "1px" : "0"}>
                  <Text fontSize="sm">{customer.name}</Text>
                  <Badge colorScheme={customer.churnProbability < 0.3 ? "green" : customer.churnProbability < 0.7 ? "yellow" : "red"}>
                    {Math.round(customer.churnProbability * 100)}%
                  </Badge>
                </Flex>
              ))}
            </Box>
            <Text mt={4} fontWeight="medium">
              Kampanya Seçin:
            </Text>
            <Select 
              mt={2} 
              placeholder="Kampanya seçin..." 
              borderColor={borderColor}
              _focus={{
                borderColor: "prometa.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-prometa-500)",
              }}
              defaultValue="ai_personalized"
            >
              <option value="ai_personalized" style={{ fontWeight: 'bold' }}>
                🤖 AI-Agent Karar Versin (Hiper-Kişiselleştirme)
              </option>
              <option value="loyalty_discount">Sadakat İndirimi (%15)</option>
              <option value="data_bonus">Ek Veri Paketi (10GB)</option>
              <option value="free_service">Ücretsiz Premium Servis (3 Ay)</option>
              <option value="custom">Özel Teklif</option>
            </Select>
            
            {/* Hiper-Kişiselleştirme bilgi kutusu */}
            <Box 
              mt={3} 
              p={3} 
              bgColor="prometa.50" 
              borderRadius="md" 
              borderLeftWidth="4px" 
              borderLeftColor="prometa.600"
              fontSize="sm"
            >
              <Text fontWeight="medium" color="prometa.700" mb={1}>
                🤖 AI-Agent Hiper-Kişiselleştirme
              </Text>
              <Text color="gray.600">
                AI-Agent, müşteri verilerini analiz ederek her müşteri için en uygun teklifi otomatik olarak belirler. 
                Müşterinin kullanım alışkanlıkları, şikayet geçmişi ve sadakat süresi gibi faktörler dikkate alınır.
              </Text>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button 
              colorScheme="prometa" 
              leftIcon={<ChatIcon />}
              mr={3}
              size="md"
              fontWeight="bold"
              px={6}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
            >
              Görüşme Başlat
            </Button>
            <Button onClick={onClose} variant="outline">İptal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Grid>
  );
};

export default CustomerDashboard; 