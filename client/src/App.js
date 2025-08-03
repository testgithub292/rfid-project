// import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000');

// function App() {
//   const [rfid, setRfid] = useState('');
//   const [lastUpdate, setLastUpdate] = useState(Date.now());

//   useEffect(() => {
//     const timeout = setInterval(() => {
//       // Reset RFID display if no new ID received in 10 seconds
//       if (Date.now() - lastUpdate > 10000) {
//         setRfid('');
//       }
//     }, 1000);

//     return () => clearInterval(timeout);
//   }, [lastUpdate]);

//   useEffect(() => {
//     socket.on('rfid', (data) => {
//       setRfid(data);
//       setLastUpdate(Date.now());
//     });
//   }, []);

//   return (
//     <div style={{ textAlign: 'center', paddingTop: '50px', fontFamily: 'Arial' }}>
//       <h1 style={{ fontSize: '3rem' }}>RFID Reader</h1>
//       <p style={{ fontSize: '2rem', color: rfid ? 'green' : 'red' }}>
//         {rfid ? `RFID Card ID: ${rfid}` : 'No RFID ID received yet'}
//       </p>
//     </div>
//   );
// }

// export default App;

// import React, { useEffect, useState } from 'react';
// import { BrowserRouter as Router, Route, Routes, Link, useParams} from 'react-router-dom';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000');

// // Local storage functions
// const getAccounts = () => {
//   const accounts = localStorage.getItem('rfidAccounts');
//   return accounts ? JSON.parse(accounts) : {};
// };

// const saveAccounts = (accounts) => {
//   localStorage.setItem('rfidAccounts', JSON.stringify(accounts));
// };

// function Home({ rfid, setRfid }) {
//   const [lastUpdate, setLastUpdate] = useState(Date.now());
//   const accounts = getAccounts();
//   const currentAccount = rfid ? accounts[rfid] : null;

//   useEffect(() => {
//     const timeout = setInterval(() => {
//       if (Date.now() - lastUpdate > 5000) {
//         setRfid('');
//       }
//     }, 1000);

//     return () => clearInterval(timeout);
//   }, [lastUpdate, setRfid]);

//   useEffect(() => {
//     socket.on('rfid', (data) => {
//       setRfid(data);
//       setLastUpdate(Date.now());
//     });

//     return () => {
//       socket.off('rfid');
//     };
//   }, [setRfid]);

//   return (
//     <div style={styles.container}>
//       <h1 style={styles.title}>RFID Account System</h1>
      
//       {rfid ? (
//         <div style={styles.card}>
//           <div style={{...styles.status, color: 'green'}}>
//             {currentAccount ? `Welcome, ${currentAccount.name}` : 'Unregistered Card'}
//           </div>
//           <div style={styles.rfid}>RFID: {rfid}</div>
          
//           {currentAccount && (
//             <div style={styles.accountInfo}>
//               <div style={styles.balance}>
//                 Balance: ${currentAccount.balance.toFixed(2)}
//               </div>
//               <Link 
//                 to={`/account/${rfid}`}
//                 style={styles.button}
//               >
//                 Manage Account
//               </Link>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div style={styles.card}>
//           <div style={{...styles.status, color: 'red'}}>
//             No RFID Card Detected
//           </div>
//           <div style={styles.message}>
//             Please tap your RFID card on the reader
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function AccountDashboard() {
//   const { rfid } = useParams();
//   const [accounts, setAccounts] = useState(getAccounts());
//   const account = accounts[rfid] || null;
//   const [transferData, setTransferData] = useState({
//     toRfid: '',
//     amount: 0
//   });
//   const [message, setMessage] = useState({ text: '', isError: false });
//   const [showSendDialog, setShowSendDialog] = useState(false);

//   if (!account) {
//     return (
//       <div style={styles.container}>
//         <div style={{...styles.status, color: 'red'}}>
//           No account found for this RFID card
//         </div>
//         <Link 
//           to="/admin"
//           style={styles.button}
//         >
//           Register This Card
//         </Link>
//       </div>
//     );
//   }

//   const handleTransfer = () => {
//     if (!accounts[transferData.toRfid]) {
//       setMessage({ text: 'Recipient account not found', isError: true });
//       return;
//     }

//     if (account.balance < transferData.amount) {
//       setMessage({ text: 'Insufficient balance', isError: true });
//       return;
//     }

//     const updatedAccounts = { ...accounts };
    
//     // Deduct from sender
//     updatedAccounts[rfid] = {
//       ...updatedAccounts[rfid],
//       balance: updatedAccounts[rfid].balance - transferData.amount,
//       transactions: [
//         ...updatedAccounts[rfid].transactions,
//         {
//           amount: transferData.amount,
//           date: new Date().toISOString(),
//           to: transferData.toRfid,
//           type: 'sent'
//         }
//       ]
//     };

//     // Add to recipient
//     updatedAccounts[transferData.toRfid] = {
//       ...updatedAccounts[transferData.toRfid],
//       balance: updatedAccounts[transferData.toRfid].balance + transferData.amount,
//       transactions: [
//         ...updatedAccounts[transferData.toRfid].transactions,
//         {
//           amount: transferData.amount,
//           date: new Date().toISOString(),
//           from: rfid,
//           type: 'received'
//         }
//       ]
//     };

//     setAccounts(updatedAccounts);
//     saveAccounts(updatedAccounts);
//     setMessage({ text: 'Transfer successful', isError: false });
//     setTransferData({ toRfid: '', amount: 0 });
//     setShowSendDialog(false);
//   };

//   return (
//     <div style={styles.container}>
//       {message.text && (
//         <div style={{
//           ...styles.alert,
//           background: message.isError ? '#ffebee' : '#e8f5e9',
//           color: message.isError ? '#c62828' : '#2e7d32'
//         }}>
//           {message.text}
//           <button 
//             onClick={() => setMessage({ text: '', isError: false })}
//             style={styles.closeButton}
//           >
//             ×
//           </button>
//         </div>
//       )}

//       <div style={styles.card}>
//         <h2 style={styles.sectionTitle}>Account Dashboard</h2>
        
//         <div style={styles.accountHeader}>
//           <div>
//             <div style={styles.accountDetail}>Name: {account.name}</div>
//             <div style={styles.accountDetail}>Email: {account.email}</div>
//           </div>
//           <div style={styles.balanceLarge}>
//             Balance: ${account.balance.toFixed(2)}
//           </div>
//         </div>

//         <button 
//           onClick={() => setShowSendDialog(true)}
//           style={{...styles.button, marginBottom: '20px'}}
//         >
//           Send Payment
//         </button>

//         <h3 style={styles.sectionTitle}>Transaction History</h3>
//         {account.transactions.length > 0 ? (
//           <table style={styles.table}>
//             <thead>
//               <tr>
//                 <th style={styles.tableHeader}>Date</th>
//                 <th style={styles.tableHeader}>Type</th>
//                 <th style={styles.tableHeader}>Amount</th>
//                 <th style={styles.tableHeader}>To/From</th>
//               </tr>
//             </thead>
//             <tbody>
//               {account.transactions.map((tx, index) => (
//                 <tr key={index}>
//                   <td style={styles.tableCell}>{new Date(tx.date).toLocaleString()}</td>
//                   <td style={styles.tableCell}>{tx.type === 'sent' ? 'Sent' : 'Received'}</td>
//                   <td style={styles.tableCell}>${tx.amount.toFixed(2)}</td>
//                   <td style={styles.tableCell}>
//                     {tx.type === 'sent' ? 
//                       `To: ${tx.to}` : 
//                       `From: ${accounts[tx.from]?.name || tx.from}`}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <div style={styles.message}>No transactions yet</div>
//         )}
//       </div>

//       {/* Send Payment Dialog */}
//       {showSendDialog && (
//         <div style={styles.modal}>
//           <div style={styles.modalContent}>
//             <h3 style={styles.sectionTitle}>Send Payment</h3>
//             <div style={styles.inputGroup}>
//               <label style={styles.label}>Recipient RFID:</label>
//               <input
//                 type="text"
//                 value={transferData.toRfid}
//                 onChange={(e) => setTransferData({ ...transferData, toRfid: e.target.value })}
//                 style={styles.input}
//               />
//             </div>
//             <div style={styles.inputGroup}>
//               <label style={styles.label}>Amount:</label>
//               <input
//                 type="number"
//                 value={transferData.amount}
//                 onChange={(e) => setTransferData({ ...transferData, amount: parseFloat(e.target.value) || 0 })}
//                 style={styles.input}
//               />
//             </div>
//             <div style={styles.modalButtons}>
//               <button 
//                 onClick={() => setShowSendDialog(false)}
//                 style={{...styles.button, background: '#6c757d'}}
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={handleTransfer}
//                 style={styles.button}
//               >
//                 Send
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function AdminPortal() {
//   const [accounts, setAccounts] = useState(getAccounts());
//   const [formData, setFormData] = useState({
//     rfid: '',
//     name: '',
//     email: '',
//     password: '',
//     initialAmount: 0
//   });
//   const [message, setMessage] = useState({ text: '', isError: false });

//   const handleCreateAccount = () => {
//     if (!formData.rfid || !formData.name || !formData.email || !formData.password) {
//       setMessage({ text: 'Please fill all required fields', isError: true });
//       return;
//     }

//     const updatedAccounts = {
//       ...accounts,
//       [formData.rfid]: {
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,
//         balance: formData.initialAmount || 0,
//         transactions: []
//       }
//     };

//     setAccounts(updatedAccounts);
//     saveAccounts(updatedAccounts);
//     setMessage({ text: 'Account created successfully', isError: false });
//     setFormData({
//       rfid: '',
//       name: '',
//       email: '',
//       password: '',
//       initialAmount: 0
//     });
//   };

//   return (
//     <div style={{...styles.container, maxWidth: '1200px'}}>
//       {message.text && (
//         <div style={{
//           ...styles.alert,
//           background: message.isError ? '#ffebee' : '#e8f5e9',
//           color: message.isError ? '#c62828' : '#2e7d32'
//         }}>
//           {message.text}
//           <button 
//             onClick={() => setMessage({ text: '', isError: false })}
//             style={styles.closeButton}
//           >
//             ×
//           </button>
//         </div>
//       )}

//       <div style={styles.card}>
//         <h2 style={styles.sectionTitle}>Create New Account</h2>
//         <div style={styles.formGrid}>
//           <div style={styles.inputGroup}>
//             <label style={styles.label}>RFID ID:</label>
//             <input
//               type="text"
//               value={formData.rfid}
//               onChange={(e) => setFormData({ ...formData, rfid: e.target.value })}
//               style={styles.input}
//             />
//           </div>
//           <div style={styles.inputGroup}>
//             <label style={styles.label}>Name:</label>
//             <input
//               type="text"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               style={styles.input}
//             />
//           </div>
//           <div style={styles.inputGroup}>
//             <label style={styles.label}>Email:</label>
//             <input
//               type="email"
//               value={formData.email}
//               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//               style={styles.input}
//             />
//           </div>
//           <div style={styles.inputGroup}>
//             <label style={styles.label}>Password:</label>
//             <input
//               type="password"
//               value={formData.password}
//               onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//               style={styles.input}
//             />
//           </div>
//           <div style={styles.inputGroup}>
//             <label style={styles.label}>Initial Amount:</label>
//             <input
//               type="number"
//               value={formData.initialAmount}
//               onChange={(e) => setFormData({ ...formData, initialAmount: parseFloat(e.target.value) || 0 })}
//               style={styles.input}
//             />
//           </div>
//         </div>
//         <button 
//           onClick={handleCreateAccount}
//           style={styles.button}
//         >
//           Create Account
//         </button>
//       </div>

//       <div style={styles.card}>
//         <h2 style={styles.sectionTitle}>All Accounts</h2>
//         <table style={styles.table}>
//           <thead>
//             <tr>
//               <th style={styles.tableHeader}>RFID</th>
//               <th style={styles.tableHeader}>Name</th>
//               <th style={styles.tableHeader}>Email</th>
//               <th style={styles.tableHeader}>Balance</th>
//               <th style={styles.tableHeader}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {Object.entries(accounts).map(([rfid, account]) => (
//               <tr key={rfid}>
//                 <td style={styles.tableCell}>{rfid}</td>
//                 <td style={styles.tableCell}>{account.name}</td>
//                 <td style={styles.tableCell}>{account.email}</td>
//                 <td style={styles.tableCell}>${account.balance.toFixed(2)}</td>
//                 <td style={styles.tableCell}>
//                   <Link 
//                     to={`/account/${rfid}`}
//                     style={{...styles.linkButton, marginRight: '10px'}}
//                   >
//                     View
//                   </Link>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// function App() {
//   const [rfid, setRfid] = useState('');

//   return (
//     <Router>
//       <div style={styles.navbar}>
//         <div style={styles.navTitle}>RFID Account System</div>
//         <div>
//           <Link to="/" style={styles.navLink}>Home</Link>
//           <Link to="/admin" style={styles.navLink}>Admin Portal</Link>
//         </div>
//       </div>
      
//       <Routes>
//         <Route path="/" element={<Home rfid={rfid} setRfid={setRfid} />} />
//         <Route path="/admin" element={<AdminPortal />} />
//         <Route path="/account/:rfid" element={<AccountDashboard />} />
//       </Routes>
//     </Router>
//   );
// }

// // Styles (same as previous version)
// const styles = {
//   container: {
//     maxWidth: '800px',
//     margin: '20px auto',
//     padding: '0 20px'
//   },
//   title: {
//     textAlign: 'center',
//     color: '#333',
//     marginBottom: '30px'
//   },
//   card: {
//     background: '#fff',
//     borderRadius: '8px',
//     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//     padding: '20px',
//     marginBottom: '20px'
//   },
//   status: {
//     fontSize: '24px',
//     textAlign: 'center',
//     margin: '20px 0'
//   },
//   message: {
//     textAlign: 'center',
//     marginTop: '10px',
//     color: '#666'
//   },
//   rfid: {
//     textAlign: 'center',
//     fontFamily: 'monospace',
//     color: '#333',
//     margin: '10px 0'
//   },
//   accountInfo: {
//     marginTop: '20px',
//     textAlign: 'center'
//   },
//   balance: {
//     fontSize: '20px',
//     margin: '10px 0'
//   },
//   balanceLarge: {
//     fontSize: '24px',
//     fontWeight: 'bold'
//   },
//   button: {
//     display: 'inline-block',
//     padding: '10px 20px',
//     background: '#007bff',
//     color: 'white',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     textDecoration: 'none',
//     fontSize: '16px'
//   },
//   linkButton: {
//     color: '#007bff',
//     textDecoration: 'none'
//   },
//   accountHeader: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     marginBottom: '20px',
//     alignItems: 'center'
//   },
//   accountDetail: {
//     fontSize: '18px',
//     marginBottom: '8px'
//   },
//   sectionTitle: {
//     fontSize: '20px',
//     marginBottom: '15px',
//     color: '#333',
//     borderBottom: '1px solid #eee',
//     paddingBottom: '10px'
//   },
//   table: {
//     width: '100%',
//     borderCollapse: 'collapse',
//     marginTop: '10px'
//   },
//   tableHeader: {
//     background: '#f8f9fa',
//     padding: '12px',
//     textAlign: 'left',
//     borderBottom: '1px solid #ddd'
//   },
//   tableCell: {
//     padding: '12px',
//     borderBottom: '1px solid #eee',
//     textAlign: 'left'
//   },
//   alert: {
//     padding: '15px',
//     borderRadius: '4px',
//     marginBottom: '20px',
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center'
//   },
//   closeButton: {
//     background: 'none',
//     border: 'none',
//     fontSize: '20px',
//     cursor: 'pointer',
//     padding: '0 5px'
//   },
//   modal: {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     background: 'rgba(0,0,0,0.5)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 1000
//   },
//   modalContent: {
//     background: '#fff',
//     padding: '20px',
//     borderRadius: '8px',
//     width: '400px',
//     maxWidth: '90%'
//   },
//   inputGroup: {
//     marginBottom: '15px'
//   },
//   label: {
//     display: 'block',
//     marginBottom: '5px',
//     fontWeight: 'bold'
//   },
//   input: {
//     width: '100%',
//     padding: '10px',
//     border: '1px solid #ddd',
//     borderRadius: '4px',
//     fontSize: '16px'
//   },
//   modalButtons: {
//     display: 'flex',
//     justifyContent: 'flex-end',
//     gap: '10px',
//     marginTop: '20px'
//   },
//   formGrid: {
//     display: 'grid',
//     gridTemplateColumns: '1fr 1fr',
//     gap: '20px',
//     marginBottom: '20px'
//   },
//   navbar: {
//     background: '#007bff',
//     color: 'white',
//     padding: '15px 20px',
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center'
//   },
//   navTitle: {
//     fontSize: '20px',
//     fontWeight: 'bold'
//   },
//   navLink: {
//     color: 'white',
//     textDecoration: 'none',
//     marginLeft: '20px',
//     fontSize: '16px'
//   }
// };

// export default App;
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Local storage functions
const getAccounts = () => {
  const accounts = localStorage.getItem('rfidAccounts');
  return accounts ? JSON.parse(accounts) : {};
};

const saveAccounts = (accounts) => {
  localStorage.setItem('rfidAccounts', JSON.stringify(accounts));
};

function Home({ rfid, setRfid }) {
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const accounts = getAccounts();
  const currentAccount = rfid ? accounts[rfid] : null;

  useEffect(() => {
    const timeout = setInterval(() => {
      if (Date.now() - lastUpdate > 10000) {
        setRfid('');
      }
    }, 1000);

    return () => clearInterval(timeout);
  }, [lastUpdate, setRfid]);

  useEffect(() => {
    socket.on('rfid', (data) => {
      setRfid(data);
      setLastUpdate(Date.now());
    });

    return () => {
      socket.off('rfid');
    };
  }, [setRfid]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Phixx Scan-X</h1>
      
      {rfid ? (
        <div style={styles.card}>
          <div style={{...styles.status, color: 'green'}}>
            {currentAccount ? `Welcome, ${currentAccount.name}` : 'Unregistered Card'}
          </div>
          <div style={styles.rfid}>RFID: {rfid}</div>
          
          {currentAccount && (
            <div style={styles.accountInfo}>
              <div style={styles.balance}>
                Balance: ${currentAccount.balance.toFixed(2)}
              </div>
              <Link 
                to={`/account/${rfid}`}
                style={styles.button}
              >
                Manage Account
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div style={styles.card}>
          <div style={{...styles.status, color: 'red'}}>
            No RFID Card Detected
          </div>
          <div style={styles.message}>
            Please tap your RFID card on the reader
          </div>
        </div>
      )}
    </div>
  );
}

function AccountDashboard() {
  const { rfid } = useParams();
  const [accounts, setAccounts] = useState(getAccounts());
  const account = accounts[rfid] || null;
  const [transferData, setTransferData] = useState({
    toRfid: '',
    amount: 0
  });
  const [message, setMessage] = useState({ text: '', isError: false });
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [awaitingRfid, setAwaitingRfid] = useState(false);

  // Handle RFID verification for payment
  useEffect(() => {
    if (!awaitingRfid) return;

    const handleRfid = (data) => {
      const scannedRfid = data.trim();
      if (scannedRfid === rfid) {
        completePayment();
      } else {
        setMessage({ text: 'Wrong RFID card scanned', isError: true });
        setAwaitingRfid(false);
        setIsProcessing(false);
      }
    };

    socket.on('rfid', handleRfid);

    return () => {
      socket.off('rfid', handleRfid);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awaitingRfid, rfid]);

  const completePayment = () => {
    const updatedAccounts = { ...accounts };
    
    updatedAccounts[rfid] = {
      ...updatedAccounts[rfid],
      balance: updatedAccounts[rfid].balance - transferData.amount,
      transactions: [
        ...updatedAccounts[rfid].transactions,
        {
          amount: transferData.amount,
          date: new Date().toISOString(),
          to: transferData.toRfid,
          type: 'sent'
        }
      ]
    };

    updatedAccounts[transferData.toRfid] = {
      ...updatedAccounts[transferData.toRfid],
      balance: updatedAccounts[transferData.toRfid].balance + transferData.amount,
      transactions: [
        ...updatedAccounts[transferData.toRfid].transactions,
        {
          amount: transferData.amount,
          date: new Date().toISOString(),
          from: rfid,
          type: 'received'
        }
      ]
    };

    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);
    setMessage({ text: 'Payment successful!', isError: false });
    setTransferData({ toRfid: '', amount: 0 });
    setShowSendDialog(false);
    setAwaitingRfid(false);
    setIsProcessing(false);
  };

  const handleTransfer = () => {
    if (!accounts[transferData.toRfid]) {
      setMessage({ text: 'Recipient account not found', isError: true });
      return;
    }

    if (account.balance < transferData.amount) {
      setMessage({ text: 'Insufficient balance', isError: true });
      return;
    }

    setIsProcessing(true);
    setAwaitingRfid(true);
    setMessage({ 
      text: 'Please scan your RFID card to confirm payment', 
      isError: false 
    });
  };

  if (!account) {
    return (
      <div style={styles.container}>
        <div style={{...styles.status, color: 'red'}}>
          No account found for this RFID card
        </div>
        <Link 
          to="/admin"
          style={styles.button}
        >
          Register This Card
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {message.text && (
        <div style={{
          ...styles.alert,
          background: message.isError ? '#ffebee' : '#e8f5e9',
          color: message.isError ? '#c62828' : '#2e7d32'
        }}>
          {message.text}
          {awaitingRfid && (
            <div style={styles.loading}>
              <div style={styles.loadingSpinner}></div>
              Waiting for RFID scan...
            </div>
          )}
          <button 
            onClick={() => {
              setMessage({ text: '', isError: false });
              setAwaitingRfid(false);
              setIsProcessing(false);
            }}
            style={styles.closeButton}
          >
            ×
          </button>
        </div>
      )}

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Account Dashboard</h2>
        
        <div style={styles.accountHeader}>
          <div>
            <div style={styles.accountDetail}>Name: {account.name}</div>
            <div style={styles.accountDetail}>Email: {account.email}</div>
          </div>
          <div style={styles.balanceLarge}>
            Balance: ${account.balance.toFixed(2)}
          </div>
        </div>

        <button 
          onClick={() => setShowSendDialog(true)}
          style={{...styles.button, marginBottom: '20px'}}
        >
          Send Payment
        </button>

        <h3 style={styles.sectionTitle}>Transaction History</h3>
        {account.transactions.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>Type</th>
                <th style={styles.tableHeader}>Amount</th>
                <th style={styles.tableHeader}>To/From</th>
              </tr>
            </thead>
            <tbody>
              {account.transactions.map((tx, index) => (
                <tr key={index}>
                  <td style={styles.tableCell}>{new Date(tx.date).toLocaleString()}</td>
                  <td style={styles.tableCell}>{tx.type === 'sent' ? 'Sent' : 'Received'}</td>
                  <td style={styles.tableCell}>${tx.amount.toFixed(2)}</td>
                  <td style={styles.tableCell}>
                    {tx.type === 'sent' ? 
                      `To: ${tx.to}` : 
                      `From: ${accounts[tx.from]?.name || tx.from}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.message}>No transactions yet</div>
        )}
      </div>

      {/* Send Payment Dialog */}
      {showSendDialog && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.sectionTitle}>Send Payment</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Recipient RFID:</label>
              <input
                type="text"
                value={transferData.toRfid}
                onChange={(e) => setTransferData({ ...transferData, toRfid: e.target.value })}
                style={styles.input}
                disabled={isProcessing}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Amount:</label>
              <input
                type="number"
                value={transferData.amount}
                onChange={(e) => setTransferData({ ...transferData, amount: parseFloat(e.target.value) || 0 })}
                style={styles.input}
                disabled={isProcessing}
              />
            </div>
            <div style={styles.modalButtons}>
              <button 
                onClick={() => {
                  setShowSendDialog(false);
                  setIsProcessing(false);
                  setAwaitingRfid(false);
                }}
                style={{...styles.button, background: '#6c757d'}}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={handleTransfer}
                style={styles.button}
                disabled={isProcessing || !transferData.toRfid || !transferData.amount}
              >
                {isProcessing ? (
                  <span style={styles.buttonLoading}>
                    <span style={styles.buttonSpinner}></span>
                    Processing...
                  </span>
                ) : (
                  'Send Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPortal() {
  const [accounts, setAccounts] = useState(getAccounts());
  const [formData, setFormData] = useState({
    rfid: '',
    name: '',
    email: '',
    password: '',
    initialAmount: 0
  });
  const [message, setMessage] = useState({ text: '', isError: false });

  const handleCreateAccount = () => {
    if (!formData.rfid || !formData.name || !formData.email || !formData.password) {
      setMessage({ text: 'Please fill all required fields', isError: true });
      return;
    }

    const updatedAccounts = {
      ...accounts,
      [formData.rfid]: {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        balance: formData.initialAmount || 0,
        transactions: []
      }
    };

    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);
    setMessage({ text: 'Account created successfully', isError: false });
    setFormData({
      rfid: '',
      name: '',
      email: '',
      password: '',
      initialAmount: 0
    });
  };

  return (
    <div style={{...styles.container, maxWidth: '1200px'}}>
      {message.text && (
        <div style={{
          ...styles.alert,
          background: message.isError ? '#ffebee' : '#e8f5e9',
          color: message.isError ? '#c62828' : '#2e7d32'
        }}>
          {message.text}
          <button 
            onClick={() => setMessage({ text: '', isError: false })}
            style={styles.closeButton}
          >
            ×
          </button>
        </div>
      )}

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Create New Account</h2>
        <div style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>RFID ID:</label>
            <input
              type="text"
              value={formData.rfid}
              onChange={(e) => setFormData({ ...formData, rfid: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password:</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Initial Amount:</label>
            <input
              type="number"
              value={formData.initialAmount}
              onChange={(e) => setFormData({ ...formData, initialAmount: parseFloat(e.target.value) || 0 })}
              style={styles.input}
            />
          </div>
        </div>
        <button 
          onClick={handleCreateAccount}
          style={styles.button}
        >
          Create Account
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>All Accounts</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>RFID</th>
              <th style={styles.tableHeader}>Name</th>
              <th style={styles.tableHeader}>Email</th>
              <th style={styles.tableHeader}>Balance</th>
              <th style={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(accounts).map(([rfid, account]) => (
              <tr key={rfid}>
                <td style={styles.tableCell}>{rfid}</td>
                <td style={styles.tableCell}>{account.name}</td>
                <td style={styles.tableCell}>{account.email}</td>
                <td style={styles.tableCell}>${account.balance.toFixed(2)}</td>
                <td style={styles.tableCell}>
                  <Link 
                    to={`/account/${rfid}`}
                    style={{...styles.linkButton, marginRight: '10px'}}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function App() {
  const [rfid, setRfid] = useState('');

  return (
    <Router>
      <div style={styles.navbar}>
        <div style={styles.navTitle}>Phixx Scan-X</div>
        <div>
          <Link to="/" style={styles.navLink}>Home</Link>
          <Link to="/admin" style={styles.navLink}>Admin Portal</Link>
        </div>
      </div>
      
      <Routes>
        <Route path="/" element={<Home rfid={rfid} setRfid={setRfid} />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="/account/:rfid" element={<AccountDashboard />} />
      </Routes>
    </Router>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '0 20px'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px'
  },
  card: {
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '20px',
    marginBottom: '20px'
  },
  status: {
    fontSize: '24px',
    textAlign: 'center',
    margin: '20px 0'
  },
  message: {
    textAlign: 'center',
    marginTop: '10px',
    color: '#666'
  },
  rfid: {
    textAlign: 'center',
    fontFamily: 'monospace',
    color: '#333',
    margin: '10px 0'
  },
  accountInfo: {
    marginTop: '20px',
    textAlign: 'center'
  },
  balance: {
    fontSize: '20px',
    margin: '10px 0'
  },
  balanceLarge: {
    fontSize: '24px',
    fontWeight: 'bold'
  },
  button: {
    display: 'inline-block',
    padding: '10px 20px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '16px'
  },
  linkButton: {
    color: '#007bff',
    textDecoration: 'none'
  },
  accountHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    alignItems: 'center'
  },
  accountDetail: {
    fontSize: '18px',
    marginBottom: '8px'
  },
  sectionTitle: {
    fontSize: '20px',
    marginBottom: '15px',
    color: '#333',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px'
  },
  tableHeader: {
    background: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd'
  },
  tableCell: {
    padding: '12px',
    borderBottom: '1px solid #eee',
    textAlign: 'left'
  },
  alert: {
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 5px'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '400px',
    maxWidth: '90%'
  },
  inputGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
     paddingTop: '10px',
  // paddingRight: '10px',
  paddingBottom: '10px',
  paddingLeft: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px'
  },
  navbar: {
    background: '#007bff',
    color: 'white',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navTitle: {
    fontSize: '20px',
    fontWeight: 'bold'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    marginLeft: '20px',
    fontSize: '16px'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '10px',
    color: '#007bff'
  },
  loadingSpinner: {
    border: '3px solid rgba(0,0,0,0.1)',
    borderTop: '3px solid #007bff',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite',
    marginRight: '10px'
  },
  buttonLoading: {
    display: 'flex',
    alignItems: 'center'
  },
  buttonSpinner: {
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    animation: 'spin 1s linear infinite',
    marginRight: '8px'
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  }
};

export default App;