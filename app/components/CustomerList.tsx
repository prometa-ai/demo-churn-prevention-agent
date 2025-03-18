'use client';

import { Box, List, ListItem, Text, Badge, Flex, Avatar, useColorModeValue } from '@chakra-ui/react';
import { Customer } from '../models/Customer';

interface CustomerWithBillIncrease extends Customer {
  billIncreaseRate?: number;
}

interface CustomerListProps {
  customers: CustomerWithBillIncrease[];
  selectedCustomerId: string;
  onSelectCustomer: (customer: CustomerWithBillIncrease) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ 
  customers, 
  selectedCustomerId, 
  onSelectCustomer 
}) => {
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
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const selectedBg = useColorModeValue('prometa.50', 'prometa.900');
  const selectedBorder = "prometa.500";

  // Function to get the color for data usage badge
  const getDataUsageBadgeColor = (current: number, limit: number): string => {
    const percentage = (current / limit) * 100;
    if (percentage < 50) return 'green';
    if (percentage < 80) return 'yellow';
    if (percentage < 100) return 'orange';
    return 'red';
  };

  // Function to get the color for bill increase rate badge
  const getBillIncreaseBadgeColor = (rate: number): string => {
    if (rate < 0) return 'green';
    if (rate < 10) return 'yellow';
    if (rate < 25) return 'orange';
    return 'red';
  };

  // Format the data usage as percentage
  const formatDataUsage = (current: number, limit: number): string => {
    const percentage = (current / limit) * 100;
    return `${percentage.toFixed(0)}%`;
  };

  return (
    <Box maxH="70vh" overflowY="auto" pr={2}>
      <List spacing={2}>
        {customers.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text>Müşteri bulunamadı</Text>
          </Box>
        ) : (
          customers.map(customer => (
            <ListItem 
              key={customer.id}
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor={customer.id === selectedCustomerId ? selectedBorder : borderColor}
              bg={customer.id === selectedCustomerId ? selectedBg : 'transparent'}
              _hover={{ bg: hoverBg, cursor: 'pointer' }}
              onClick={() => onSelectCustomer(customer)}
              transition="all 0.2s"
            >
              <Flex justify="space-between" align="center">
                <Flex align="center">
                  <Avatar 
                    size="sm" 
                    name={customer.name} 
                    bg={customer.id === selectedCustomerId ? "prometa.500" : "gray.400"} 
                    color="white"
                    mr={3}
                  />
                  <Box>
                    <Flex align="center">
                      <Text fontWeight="medium">{customer.name}</Text>
                      {customer.customerService.ticketsOpened > 3 && customer.customerService.averageSatisfaction < 3 && (
                        <Badge colorScheme="red" ml={2} size="sm" fontSize="xs">Yüksek Destek Talebi</Badge>
                      )}
                    </Flex>
                    <Text fontSize="xs" color="gray.500">
                      {customer.phoneNumber}
                      {customer.customerService.ticketsOpened > 3 && (
                        <Text as="span" color="red.500" ml={1} fontWeight="bold">
                          • {customer.customerService.ticketsOpened} Talep
                        </Text>
                      )}
                      {customer.customerService.averageSatisfaction < 3 && (
                        <Text as="span" color="red.500" ml={1} fontWeight="bold">
                          • {customer.customerService.averageSatisfaction.toFixed(1)}/5
                        </Text>
                      )}
                    </Text>
                    <Flex mt={1} fontSize="xs" align="center">
                      <Badge 
                        colorScheme={getDataUsageBadgeColor(customer.usage.dataUsage.current, customer.usage.dataUsage.limit)}
                        variant="subtle"
                        px={1}
                        fontSize="0.6rem"
                      >
                        Veri: {formatDataUsage(customer.usage.dataUsage.current, customer.usage.dataUsage.limit)}
                      </Badge>
                      {customer.billIncreaseRate !== undefined && (
                        <Badge 
                          colorScheme={getBillIncreaseBadgeColor(customer.billIncreaseRate)}
                          variant="subtle"
                          ml={1}
                          px={1}
                          fontSize="0.6rem"
                        >
                          Fatura: {customer.billIncreaseRate > 0 ? '+' : ''}{customer.billIncreaseRate.toFixed(0)}%
                        </Badge>
                      )}
                    </Flex>
                  </Box>
                </Flex>
                <Flex direction="column" align="flex-end">
                  <Badge 
                    colorScheme={getChurnBadgeColor(customer.churnProbability)}
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {formatChurnProbability(customer.churnProbability)}
                  </Badge>
                  {customer.customerService.ticketsOpened > 3 && customer.customerService.averageSatisfaction < 3 && (
                    <Box mt={1} w={2} h={2} borderRadius="full" bg="red.500"></Box>
                  )}
                </Flex>
              </Flex>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default CustomerList; 