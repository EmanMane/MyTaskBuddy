const client = require('./connection.js')
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Define webhook endpoint
app.post('/tasksInsert', async (req, res) => {
  try {
    // Extract relevant data from the webhook payload
    const { type, table, schema, record } = req.body;

    // Check if the event is an INSERT and the table is 'tasks'
    if (type === 'INSERT' && schema === 'public' && table === 'tasks') {
      // Extract data about the new task from the payload
      const { activity, userId } = record;

      // Check if the task is for a specific user (e.g., userId === 2)
      await sendPushNotificationToUser(userId, activity);
    }

    // Respond with success status
    res.status(200).send('Webhook received successfully.');
  } catch (error) {
    console.error('Error handling webhook:', error);
    // Respond with error status
    res.status(500).send('Error handling webhook.');
  }
});


// Function to send push notification to all devices of a user
async function sendPushNotificationToUser(userId, activity) {
  try {
    // Fetch all expo push tokens associated with the user ID from the database
    const expoPushTokens = await getExpoPushTokens(userId);

    // Check if any expo push tokens are available
    if (expoPushTokens.length > 0) {
      // Construct the message
      const message = {
        sound: 'default',
        title: 'Novi Zadatak',
        body: `Imate novi zadatak: ${activity}`,
      };

      // Send the push notification to each expo push token
      await Promise.all(
        expoPushTokens.map(async (expoPushToken) => {
          await sendPushNotification(expoPushToken, message);
        })
      );
    } else {
      console.log(`Expo push tokens not found for user ${userId}`);
    }
  } catch (error) {
    console.error('Error sending push notification to user:', error);
  }
}

// Function to fetch all expo push tokens associated with a user from the database
async function getExpoPushTokens(userId) {
  try {
    // Query the database to fetch all expo push tokens associated with the user ID
    const result = await client.query('SELECT expo_token FROM devices WHERE "userId" = $1', [userId]);

    // Extract expo push tokens from the query result
    const expoPushTokens = result.rows.map(row => row.expo_token);

    return expoPushTokens;
  } catch (error) {
    console.error('Error fetching expo push tokens for user:', error);
    return [];
  }
}

// Function to send push notification
async function sendPushNotification(expoPushToken, message) {
  try {
    // Construct the message with the expo push token
    const pushMessage = { ...message, to: expoPushToken };

    // Send the push notification
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pushMessage),
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

app.post('/users/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    const query = `
      SELECT * FROM users
      WHERE username = $1 AND password = $2
      LIMIT 1;
    `;
  
    const values = [username, password];
  
    try {
      const { rows } = await client.query(query, values);
  
      if (rows.length === 1) {
        const query2 = `
         SELECT id FROM users
          WHERE username = $1 AND password = $2;
        `;

         const result = await client.query(query2, values);
         const userId = result.rows[0].id;
        res.status(200).json({ message: 'Logged in successfully!', userId:userId});
      } else {
        res.status(401).json({ message: 'Invalid username or password' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'An error occurred' });
    }
});

app.post('/users/register', async(req,res) => {
  try{
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const username = req.body.username;
    const password = req.body.password;
    const avatar = req.body.avatar;


    //Check for empty fields
    if(!firstname || !lastname || !username || !password) {
      throw new Error('Sva polja trebaju biti popunjena!');
    }
    // Check the format of firstname and lastname
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(firstname) || !nameRegex.test(lastname)) {
      throw new Error('Nevažeći format za ime ili prezime');
    }
    // Check if the username already exists
    const userExists = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      throw new Error('Korisničko ime već postoji');
    }

    // Insert the parameters into the users table
    await client.query(
      'INSERT INTO users (firstname, lastname, username, password, avatar) VALUES ($1, $2, $3, $4, $5)',
      [firstname, lastname, username, password, avatar]
    );
    const query2 = `
    SELECT id FROM users
     WHERE username = $1 AND password = $2;
   `;
    const values = [username, password];
    const result = await client.query(query2, values);
    const userId = result.rows[0].id;
    res.status(200).json({ message: 'Registration successful', userId:userId} );
  }
  catch(error){
    res.status(400).json({ error: error.message });
  }
})

app.get('/tasks', async (req, res) => {
  try {
    const { userId,status,date } = req.query;

    // Fetch tasks based on the provided userId from the tasks table
    const query = 'SELECT * FROM tasks WHERE "userId" = $1 and status = $2 and date = $3';
    const values = [userId,status,date];
    const result = await client.query(query, values);

    // Get the rows from the result
    const tasks = result.rows;

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Dohvacanje kompletiranih zadataka na osnovu usera (za medalje)
app.get('/completed-tasks', async (req, res) => {
  try {
    const { userId } = req.query;

    // First, count the number of completed tasks for the user
    const countQuery = 'SELECT COUNT(*) FROM tasks WHERE "userId" = $1 AND "status" = 2';
    const countValues = [userId];
    const countResult = await client.query(countQuery, countValues);

    res.json({ completed_tasks: countResult.rows[0].count });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/userdetails', async (req, res) => {
  try {
    const { userId } = req.query;

    // Fetch user details based on the provided id
    const query = 'SELECT * FROM users WHERE id = $1 ';
    const values = [userId];
    const result = await client.query(query, values);

    // Get the row from the result
    const details = result.rows[0];

    res.json(details);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT request to update the current user of device (for expo notifications)
app.put('/devices/:deviceExpoToken', async (req, res) => {
  const { deviceExpoToken } = req.params; // This is the expo_token in db
  const { userId } = req.body;

  try {
    // Check if the device exists in the database
    const existingDevice = await client.query('SELECT * FROM devices WHERE "expo_token" = $1', [deviceExpoToken]);

    if (existingDevice.rows.length === 0) {
      // If the device doesn't exist, insert a new row with the expo_token and userId
      await client.query('INSERT INTO devices (expo_token, "userId") VALUES ($1, $2)', [deviceExpoToken, userId]);
      
      // Return a success response
      return res.status(201).json({ message: 'Device created successfully' });
    }

    // Get the existing device data
    const device = existingDevice.rows[0];

    // If the userId has changed, update the device with the new userId
    if (userId !== device.userId) {
      await client.query('UPDATE devices SET "userId" = $1 WHERE expo_token = $2', [userId, deviceExpoToken]);
      
      // Return a success response
      return res.status(200).json({ message: 'Device updated successfully' });
    }

    // If the userId hasn't changed, return a response indicating no changes
    return res.status(200).json({ message: 'No changes made to the device' });
  } catch (error) {
    console.error('Error updating device:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// PUT request to update the user's profile
app.put('/users/:userId/profile', async (req, res) => {
  const { userId } = req.params;
  const { username, password } = req.body;

  try {
    // Get the existing user data from the database
    const existingUser = await client.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = existingUser.rows[0];

    // Check if the new username or password is different from the existing ones
    if (username !== user.username || password !== user.password) {
      // Perform the update operation
      await client.query('UPDATE users SET username = $1, password = $2 WHERE id = $3', [username, password, userId]);

      // Return a success response
      return res.status(200).json({ message: 'Profile updated successfully' });
    }

    // If the new username and password are the same as the existing ones
    // Return a response indicating that no changes were made
    return res.status(200).json({ message: 'No changes made to the profile' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET route to fetch user's first name based on user ID
app.get('/users/:userId/firstname', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = 'SELECT firstname FROM users WHERE id = $1';
    const values = [userId];

    const result = await client.query(query, values);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ firstName: user.firstname });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Fetch the substeps based on taskId
app.get('/substeps/:taskId', async (req, res) => {
  const { taskId } = req.params;
  try {
    const result = await client.query(
      'SELECT id, "stepName", description, status FROM substeps WHERE "taskId" = $1 ORDER BY id ASC',
      [taskId]
    );
    const substeps = result.rows;
    res.json({ substeps });
  } catch (error) {
    console.error('Error fetching substeps:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/tasks/:taskId/update-status', async (req, res) => {
  const { taskId } = req.params;
  const { status} = req.body;

  try {
    // Update the status and userStartTime of the task in the tasks table
    const query = 'UPDATE tasks SET status = $1 WHERE id = $2';
    const values = [status, taskId];
    await client.query(query, values);

    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.sendStatus(500);
  }
});
app.put('/tasks/:taskId/update-userStartTime', async (req, res) => {
  const { taskId } = req.params;
  const { userStartTime} = req.body;

  try {
    // Update the status and userStartTime of the task in the tasks table
    const query = 'UPDATE tasks SET "userStartTime" = $1 WHERE id = $2';
    const values = [userStartTime, taskId];
    await client.query(query, values);

    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating userStartTime:', error);
    res.sendStatus(500);
  }
});
app.put('/tasks/:taskId/update-userEndTime', async (req, res) => {
  const { taskId } = req.params;
  const { userEndTime} = req.body;

  try {
    // Update the status and userStartTime of the task in the tasks table
    const query = 'UPDATE tasks SET "userEndTime" = $1 WHERE id = $2';
    const values = [userEndTime, taskId];
    await client.query(query, values);

    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating userEndTime:', error);
    res.sendStatus(500);
  }
});

app.put('/tasks/:taskId/update-help', async (req, res) => {
  const { taskId } = req.params;
  const { help } = req.body;

  try {
    // Update the status and userStartTime of the task in the tasks table
    const query = 'UPDATE tasks SET help = $1 WHERE id = $2';
    const values = [help, taskId];
    await client.query(query, values);

    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating task help:', error);
    res.sendStatus(500);
  }
});

app.put('/tasks/update-progress/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { progress } = req.body;

  try {
    // Update the progress of the task in the tasks table
    const query = 'UPDATE tasks SET progress = $1 WHERE id = $2';
    const values = [progress, taskId];
    await client.query(query, values);

    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating task progress:', error);
    res.sendStatus(500);
  }
});

app.get('/tasks/:taskId/status', async (req, res) => {
  const { taskId } = req.params;

  try {
    const query = 'SELECT status FROM tasks WHERE id = $1';
    const values = [taskId];

    const result = await client.query(query, values);
    const task = result.rows[0];

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ status: task.status });
  } catch (error) {
    console.error('Error fetching task status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update step status endpoint
app.post('/substeps/update-step', async (req, res) => {
  const { stepId, status } = req.body;

  try {
    const query = 'UPDATE substeps SET status = $1 WHERE id = $2';
    const values = [status, stepId];
    await client.query(query, values);

    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating step status:', error);
    res.sendStatus(500);
  }
});

// Get parent details endpoint
app.get('/parents/:parentId', async (req, res) => {
  const { parentId } = req.params;

  try {
    const query = 'SELECT firstname , lastname FROM parents WHERE id = $1';
    const values = [parentId];
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const parentDetails = result.rows[0];
    res.status(200).json(parentDetails);
  } catch (error) {
    console.error('Error fetching parent details:', error);
    res.sendStatus(500);
  }
});

// Lokalno pokretanje (Vercel zanemaruje ovaj dio)
app.listen(3000, ()=>{
  console.log("Server is now listening at port 3000");
}) 

client.connect();

module.exports = app;