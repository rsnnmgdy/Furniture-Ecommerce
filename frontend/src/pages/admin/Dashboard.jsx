import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ShoppingBag,
  People,
  AttachMoney,
  Inventory,
  TrendingUp,
  ShoppingCart,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Loading from '../../components/common/Loading';

// Professional furniture-inspired color palette
const COLORS = ['#C67C4E', '#8B6F47', '#D4A574', '#A0825D', '#6B5344'];
const PRIMARY_GRADIENT = 'linear-gradient(135deg, #C67C4E 0%, #8B6F47 100%)';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [selectedYear]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.stats);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await api.get(`/admin/sales?year=${selectedYear}`);
      setSalesData(response);
    } catch (error) {
      console.error('Failed to load sales data');
    }
  };

  if (loading) return <Loading />;

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card 
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%)',
        border: '1px solid #E8E8E8',
        borderRadius: '12px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(198, 124, 78, 0.15)',
          borderColor: color,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography 
              color="textSecondary" 
              variant="body2" 
              gutterBottom
              sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              fontWeight={700}
              sx={{ 
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                my: 1
              }}
            >
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <TrendingUp sx={{ fontSize: 16, color: trend > 0 ? '#4CAF50' : '#FF6B6B' }} />
                <Typography variant="caption" sx={{ color: trend > 0 ? '#4CAF50' : '#FF6B6B', fontWeight: 600 }}>
                  {trend > 0 ? '+' : ''}{trend}% vs last month
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${color}40`,
            }}
          >
            <Icon sx={{ fontSize: 32, color, opacity: 0.9 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={4}>
        <Typography 
          variant="h3" 
          fontWeight={700}
          sx={{
            background: PRIMARY_GRADIENT,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
          Welcome back! Here's your business performance at a glance.
        </Typography>
      </Box>

      {/* Stats Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            icon={Inventory}
            color="#C67C4E"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={People}
            color="#D4A574"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={ShoppingBag}
            color="#A0825D"
            trend={15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${stats?.totalRevenue || '0.00'}`}
            icon={AttachMoney}
            color="#8B6F47"
            trend={22}
          />
        </Grid>
      </Grid>

      {/* Quick Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card 
            sx={{
              background: 'linear-gradient(135deg, #C67C4E 0%, #A0825D 100%)',
              color: 'white',
              borderRadius: '12px',
              border: 'none',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ShoppingCart sx={{ fontSize: 40, opacity: 0.8 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Today's Orders</Typography>
                  <Typography variant="h4" fontWeight={700}>{stats?.todayOrders || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card 
            sx={{
              background: 'linear-gradient(135deg, #D4A574 0%, #C67C4E 100%)',
              color: 'white',
              borderRadius: '12px',
              border: 'none',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Today's Revenue</Typography>
                  <Typography variant="h4" fontWeight={700}>${stats?.todayRevenue || '0.00'}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      {salesData && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <Card 
              sx={{
                borderRadius: '12px',
                border: '1px solid #E8E8E8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                p: 3,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography 
                    variant="h6" 
                    fontWeight={700}
                    sx={{ color: '#2C2C2C' }}
                  >
                    Monthly Sales Performance
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Revenue & Order Trends
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    label="Year"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <MenuItem value={2025}>2025</MenuItem>
                    <MenuItem value={2024}>2024</MenuItem>
                    <MenuItem value={2023}>2023</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData.salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" />
                  <XAxis dataKey="month" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      background: '#FFFFFF',
                      border: '1px solid #E8E8E8',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalSales"
                    stroke="#C67C4E"
                    strokeWidth={3}
                    dot={{ fill: '#C67C4E', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="orderCount"
                    stroke="#D4A574"
                    strokeWidth={3}
                    dot={{ fill: '#D4A574', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card 
              sx={{
                borderRadius: '12px',
                border: '1px solid #E8E8E8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                p: 3,
              }}
            >
              <Typography 
                variant="h6" 
                fontWeight={700}
                mb={3}
                sx={{ color: '#2C2C2C' }}
              >
                Sales by Category
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={salesData.categorySales}
                    dataKey="totalSales"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
                  >
                    {salesData.categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card 
              sx={{
                borderRadius: '12px',
                border: '1px solid #E8E8E8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                p: 3,
              }}
            >
              <Typography 
                variant="h6" 
                fontWeight={700}
                mb={3}
                sx={{ color: '#2C2C2C' }}
              >
                Monthly Revenue Bar Chart
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData.salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" />
                  <XAxis dataKey="month" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      background: '#FFFFFF',
                      border: '1px solid #E8E8E8',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="totalSales" fill="#C67C4E" name="Revenue" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recent Orders & Quick Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card 
            sx={{
              borderRadius: '12px',
              border: '1px solid #E8E8E8',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #E8E8E8' }}>
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ color: '#2C2C2C' }}
                >
                  Recent Orders
                </Typography>
              </Box>
              <Table sx={{ '& .MuiTableCell-root': { borderBottomColor: '#EFEFEF' } }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#666' }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.recentOrders?.slice(0, 5).map((order) => (
                    <TableRow 
                      key={order._id}
                      sx={{
                        '&:hover': { backgroundColor: '#FAFAFA' },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>{order.user?.name}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#C67C4E' }}>
                        {formatCurrency(order.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          size="small"
                          sx={{
                            backgroundColor: 
                              order.status === 'Delivered' ? '#E8F5E9' :
                              order.status === 'Shipped' ? '#E3F2FD' :
                              order.status === 'Processing' ? '#FFF3E0' :
                              '#FFEBEE',
                            color: 
                              order.status === 'Delivered' ? '#2E7D32' :
                              order.status === 'Shipped' ? '#1976D2' :
                              order.status === 'Processing' ? '#F57C00' :
                              '#C62828',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#666' }}>{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card 
            sx={{
              borderRadius: '12px',
              border: '1px solid #E8E8E8',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                fontWeight={700}
                mb={3}
                sx={{ color: '#2C2C2C' }}
              >
                Quick Stats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #C67C4E20, #C67C4E10)',
                  borderLeft: '4px solid #C67C4E'
                }}>
                  <Typography variant="caption" color="textSecondary">Average Order Value</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#C67C4E', mt: 0.5 }}>
                    ${((stats?.totalRevenue || 0) / (stats?.totalOrders || 1)).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #D4A57420, #D4A57410)',
                  borderLeft: '4px solid #D4A574'
                }}>
                  <Typography variant="caption" color="textSecondary">Conversion Rate</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A574', mt: 0.5 }}>
                    {((stats?.totalOrders || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #A0825D20, #A0825D10)',
                  borderLeft: '4px solid #A0825D'
                }}>
                  <Typography variant="caption" color="textSecondary">Active Products</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#A0825D', mt: 0.5 }}>
                    {stats?.totalProducts || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>  
  );
};

export default Dashboard;
