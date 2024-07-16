import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Input } from "antd";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "antd/dist/reset.css"; // or "antd/dist/antd.css" if using Ant Design v4

// Register required components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get("/api/data");
        console.log("API Data:", result.data); // Log the data
        setCustomers(result.data.customers);
        setTransactions(result.data.transactions);
        setFilteredData(result.data.transactions);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleFilter = (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = transactions.filter(
      (transaction) =>
        customers.find(
          (c) =>
            c.id === transaction.customer_id &&
            c.name.toLowerCase().includes(value)
        ) || transaction.amount.toString().includes(value)
    );
    setFilteredData(filtered);
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomer(customerId);
    const customerTransactions = transactions.filter(
      (t) => t.customer_id === customerId
    );

    // Calculate total transaction amount per day
    const dates = [...new Set(customerTransactions.map((t) => t.date))];
    const amounts = dates.map((date) =>
      customerTransactions
        .filter((t) => t.date === date)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    // Set chart data
    setChartData({
      labels: dates,
      datasets: [
        {
          label: "Total Transaction Amount",
          data: amounts,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    });
  };

  const columns = [
    {
      title: "Customer Name",
      dataIndex: "customer_id",
      key: "customer_id",
      render: (text) => customers.find((c) => c.id === text)?.name,
    },
    {
      title: "Transaction Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Transaction Amount",
      dataIndex: "amount",
      key: "amount",
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Input
        placeholder="Filter by name or amount"
        onChange={handleFilter}
        style={{ marginBottom: 20 }}
      />
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleSelectCustomer(record.customer_id),
        })}
      />
      {selectedCustomer && (
        <div style={{ marginTop: 20 }}>
          <h2>
            Transaction History for{" "}
            {customers.find((c) => c.id === selectedCustomer)?.name}
          </h2>
          <Line data={chartData} />
        </div>
      )}
    </div>
  );
};

export default App;
