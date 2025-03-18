'use client';

import { Box, List, ListItem, Text, Badge, Flex, Avatar, useColorModeValue } from '@chakra-ui/react';
import { Customer } from '../models/Customer';

interface CustomerListProps {
  customers: Customer[];
  selectedCustomerId: string;
  onSelectCustomer: (customer: Customer) => void;
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
                    <Text fontWeight="medium">{customer.name}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {customer.phoneNumber}
                    </Text>
                  </Box>
                </Flex>
                <Badge 
                  colorScheme={getChurnBadgeColor(customer.churnProbability)}
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {formatChurnProbability(customer.churnProbability)}
                </Badge>
              </Flex>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default CustomerList; 