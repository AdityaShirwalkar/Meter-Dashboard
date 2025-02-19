const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  // password: #YOUR-PASSWORD, Enter your database password and uncomment the line
  database: 'dashboard'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

setInterval(() => {
  connection.ping((err) => {
    if (err) {
      console.error('Database ping error:', err);
    }
  });
}, 60000);


const isAdmin = async (req, res, next) => {
  try {
    const [users] = await connection.promise().query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

app.get('/api/users/:username/role', authenticateToken, async (req, res) => {
  try {
    const [users] = await connection.promise().query(
      'SELECT role FROM users WHERE username = ?',
      [req.params.username]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ role: users[0].role });
  } catch (error) {
    console.error('Err only)or fetching user role:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await connection.promise().query(
      'SELECT id, username, role, created_at FROM users'
    );

    // Remove sensitive information
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      created_at: user.created_at
    }));

    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change user role (admin
app.patch('/api/users/:userId/role', authenticateToken, isAdmin, async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  // Validate role
  if (role !== 'admin' && role !== 'user') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    // Check if user exists
    const [users] = await connection.promise().query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user role
    await connection.promise().query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users/reset-password', authenticateToken, async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  
  try {
    const [users] = await connection.promise().query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await connection.promise().query(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, username]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error updating password' });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const [existingUser] = await connection.promise().query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.promise().query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, 'user']
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Get user from database
    const [users] = await connection.promise().query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      console.log('User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    
    // console.log('Login attempt:', {
    //   username,
    //   providedPassword: password,
    //   storedHash: user.password
    // });

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await connection.promise().query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, user.id]
    );

    res.json({
      token,
      refreshToken,
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

app.get('/api/data/firmware_version', (req, res) => {
  const query = 'SELECT firmware_version FROM firmware_versions';
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('Firmware Versions Query Results:', results);
    res.json(results);
  });
});

app.get('/api/data/firmware_versions', (req, res) => {
  const query = 'SELECT firmware_version, start_date, end_date FROM firmware_versions WHERE version_enabled = true';
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.put('/api/data/firmware/:unitNo', (req, res) => {
  const { unitNo } = req.params;
  const { Firmware_version, activation_date, firmware_availability } = req.body;
  
  console.log('Received update request:', { unitNo, Firmware_version, activation_date, firmware_availability });

  if (Firmware_version === null) {
    const updateQuery = 'UPDATE firmware SET Firmware_version = ?, activation_date = ?, firmware_availability = ? WHERE MeterNo = ?';
    
    connection.query(updateQuery, [Firmware_version, activation_date, firmware_availability, unitNo], (err, result) => {
      if (err) {
        console.error('Update query error:', err);
        return res.status(500).json({ error: 'Database error in update' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Firmware data not found' });
      }
      
      res.json({ message: 'Firmware data updated successfully' });
    });
    return;
  }

  if (!Firmware_version || !activation_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const versionQuery = 'SELECT start_date, end_date FROM firmware_versions WHERE firmware_version = ? AND version_enabled = true';
  
  connection.query(versionQuery, [Firmware_version], (versionErr, versionResults) => {
    if (versionErr) {
      console.error('Version query error:', versionErr);
      return res.status(500).json({ error: 'Database error in version validation' });
    }
    
    if (versionResults.length === 0) {
      return res.status(400).json({ error: 'Invalid or disabled firmware version' });
    }
    
    const { start_date, end_date } = versionResults[0];
    const activationDate = new Date(activation_date);
    
    if (activationDate < new Date(start_date) || activationDate > new Date(end_date)) {
      return res.status(400).json({ 
        error: `Activation date must be between ${start_date} and ${end_date}` 
      });
    }
    
    const updateQuery = 'UPDATE firmware SET Firmware_version = ?, activation_date = ?, firmware_availability = ? WHERE MeterNo = ?';
    
    connection.query(updateQuery, [Firmware_version, activation_date, firmware_availability, unitNo], (err, result) => {
      if (err) {
        console.error('Update query error:', err);
        return res.status(500).json({ error: 'Database error in update' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Firmware data not found' });
      }
      
      res.json({ message: 'Firmware data updated successfully' });
    });
  });
});

app.get('/api/data/:tableName', (req, res) => {
  const { tableName } = req.params;
  const query = `SELECT * FROM ${tableName}`;
  
  console.log('Executing query:', query); 
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    console.log('Query results:', results); 
    
    if (!results) {
      res.status(404).json({ error: 'No data found' });
      return;
    }
    
    try {
      res.json(results);
    } catch (error) {
      console.error('Error sending response:', error);
      res.status(500).json({ error: 'Error processing response' });
    }
  });
});

//Update meter data
app.put('/api/data/metertable/:unitNo',(req,res) => {
  const {unitNo} = req.params;
  const {Metertype,Model,description,ip_address,communication_id} = req.body;

  const query = `UPDATE MeterTable 
        SET Metertype = ?, 
        Model = ?, 
        description = ?, 
        ip_address = ?, 
        communication_id = ?
        WHERE UnitNo=?`
  
  connection.query(
    query,
    [Metertype,Model,description,ip_address,communication_id,unitNo],
    (err,result) => {
      if(err) {
        console.error('Database error:',err);
        res.status(500).json({error:err.message});
        return;
      }

      if(result.affectedRows === 0) {
        res.status(400).json({error:'Meter not found'});
        return;
      }

      res.json({
        message:'Meter Updated Successfully',
        affectedRows: result.affectedRows
      });
    }
  )
})

// firmware details
app.get('/api/data/firmware/:unitNo',(req, res) => {
  const { unitNo } = req.params;
  const query = 'SELECT * FROM firmware WHERE MeterNo = ?';
  
  console.log('Fetching firmware data for unit:', unitNo);

  connection.query(query, [unitNo], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('Firmware query results:', results);
    if (results.length === 0) {
      res.status(404).json({ error: 'Firmware data not found' });
      return;
    }
    res.json(results[0]);
  });
});

//add a firmware version
app.post('/api/data/firmware_versions',(req,res) => {
  const { firmware_version,start_date,end_date,version_enabled } = req.body;
  const firmwareVersionQuery = 'INSERT INTO firmware_versions(firmware_version,start_date,end_date,version_enabled) VALUES(?,?,?,?)';

  connection.beginTransaction((err) => {
    if(err) {
      console.error('Error beginning transaction:',err);
      res.status(500).json({error:err.message});
      return;
    }

    connection.query(firmwareVersionQuery,[firmware_version,start_date,end_date,version_enabled],(err,result) => 
    {
      if(err) {
        return connection.rollback(()=> {
          console.error('Error inserting the new version:', err);
          res.status(500).json({error:err.message});
        });
      }
      connection.commit((err) => {
        if(err) {
          return connection.rollback(() => {
            console.error('Error committing transaction:',err);
            res.status(500).json({error : err.message});
          });
        }
        res.json({message: 'New version created successfully'});
      });
    });
  });
});

//Update the firmware version
app.patch('/api/data/firmware_versions', (req, res) => {
  console.log('Patch request body:', req.body);
  
  const { firmware_version, start_date, end_date, version_enabled } = req.body;
  
  if (!firmware_version) {
    return res.status(400).json({ error: 'Firmware version is required' });
  }

  const updateFields = [];
  const queryParams = [];
  
  if (start_date !== undefined) {
    updateFields.push('start_date = ?');
    queryParams.push(start_date);
  }
  
  if (end_date !== undefined) {
    updateFields.push('end_date = ?');
    queryParams.push(end_date);
  }
  
  if (version_enabled !== undefined) {
    updateFields.push('version_enabled = ?');
    queryParams.push(version_enabled);
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  queryParams.push(firmware_version);
  
  const query = `UPDATE firmware_versions SET ${updateFields.join(', ')} WHERE firmware_version = ?`;
  
  console.log('Update query:', query);
  console.log('Query parameters:', queryParams);
  
  connection.query(query, queryParams, (err, result) => {
    if (err) {
      console.error('Database error details:', {
        message: err.message,
        code: err.code,
        sqlMessage: err.sqlMessage,
        sql: err.sql
      });
      res.status(500).json({ error: 'Database update failed', details: err.message });
      return;
    }
    
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Firmware version not found' });
      return;
    }
    
    res.json({ message: 'Firmware version updated successfully', affectedRows: result.affectedRows });
  });
});

//firmware version
// app.get('/api/data/firmware-versions', (req, res) => {
//   console.log('Accessing firmware versions endpoint');
  
//   const query = 'SELECT firmware_version FROM firmware_versions';
  
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error('Database query error:', err);
//       return res.status(500).json({ 
//         error: 'Database query failed', 
//         details: err.toString() 
//       });
//     }
    
//     console.log('Raw query results:', results);
    
//     if (!results || results.length === 0) {
//       console.warn('No firmware versions found');
//       return res.json([]);
//     }
    
//     const versions = results.map(row => row.firmware_version);
//     console.log('Extracted versions:', versions);
//     res.json(versions);
//   });
// });

//state details

app.get('/api/data/state', (req, res) => {
  const query = 'SELECT * FROM state';
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// state details
app.get('/api/data/state/:unitNo', (req, res) => {
  const { unitNo } = req.params;
  const query = 'SELECT * FROM state WHERE unit_no = ?';
  
  connection.query(query, [unitNo], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('State query results:', results);
    if (results.length === 0) {
      res.status(404).json({ error: 'State data not found' });
      return;
    }
    res.json(results[0]);
  });
});

app.put('/api/data/state/:unitNo', (req, res) => {
  const { unitNo } = req.params;
  const { state, reason, mode } = req.body;
  const query = 'UPDATE state SET state = ?, reason = ?, mode = ? WHERE unit_no = ?';
  
  connection.query(query, [state, reason, mode, unitNo], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'State data not found' });
      return;
    }
    res.json({ message: 'State data updated successfully' });
  });
});

// Creating a new meter
app.post('/api/data/meter',(req, res) => {
  const { UnitNo, Metertype, Model, description, ip_address, communication_id } = req.body;
  
  const meterQuery = 'INSERT INTO MeterTable (UnitNo, Metertype, Model, description, ip_address, communication_id) VALUES (?, ?, ?, ?, ?, ?)';
  const firmwareQuery = 'INSERT INTO firmware (MeterNo) VALUES (?)';
  const stateQuery = 'INSERT INTO state (unit_no) VALUES (?)';

  connection.beginTransaction((err) => {
    if (err) {
      console.error('Error beginning transaction:', err);
      res.status(500).json({ error: err.message });
      return;
    }

    connection.query(meterQuery, [UnitNo, Metertype, Model, description, ip_address, communication_id], (err, result) => {
      if (err) {
        return connection.rollback(() => {
          console.error('Error inserting meter data:', err);
          res.status(500).json({ error: err.message });
        });
      }

      connection.query(firmwareQuery, [UnitNo], (err, result) => {
        if (err) {
          return connection.rollback(() => {
            console.error('Error inserting firmware data:', err);
            res.status(500).json({ error: err.message });
          });
        }

        connection.query(stateQuery, [UnitNo], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              console.error('Error inserting state data:', err);
              res.status(500).json({ error: err.message });
            });
          }

          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                console.error('Error committing transaction:', err);
                res.status(500).json({ error: err.message });
              });
            }
            res.json({ message: 'New meter created successfully' });
          });
        });
      });
    });
  });
});

app.get('/api/data/firmware', (req, res) => {
  const query = 'SELECT * FROM firmware';
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.use(function(req, res, next) { 
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  next();
});
