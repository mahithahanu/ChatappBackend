// const fetch = require('node-fetch');

// const SN_INSTANCE = 'https://dev225934.service-now.com';
// const SN_USERNAME = 'reactapi';
// const SN_PASSWORD = 'UConnect#2129';

// const getAuthHeader = () => {
//   const token = Buffer.from(`${SN_USERNAME}:${SN_PASSWORD}`).toString('base64');
//   return `Basic ${token}`;
// };

// async function findByEmail(email) {
//   const response = await fetch(
//     `${SN_INSTANCE}/api/now/table/u_logindata?sysparm_query=u_email=${encodeURIComponent(email)}`,
//     {
//       method: 'GET',
//       headers: {
//         Accept: 'application/json',
//         Authorization: getAuthHeader(),
//       },
//     }
//   );

//   if (!response.ok) {
//     const errorText = await response.text();
//     console.error('Signup failed:', errorText);
//     const errorData = JSON.parse(errorText);
//     throw new Error(errorData.error?.message || 'Signup failed');
//   }

//   const data = await response.json();
//   return data.result[0];
// }

// async function signup({ name, rollNo, email, password }) {
//   const response = await fetch(`${SN_INSTANCE}/api/now/table/u_logindata`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Accept: 'application/json',
//       Authorization: getAuthHeader(),
//     },
//     body: JSON.stringify({
//       u_name: name,
//       u_rollno: rollNo,
//       u_email: email,
//       u_password: password,
//     }),
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.error?.message || 'Signup failed');
//   }

//   const data = await response.json();
//   return data.result;
// }

// async function updatePassword(email, newPassword) {
//   const user = await findByEmail(email);
//   if (!user) throw new Error('User not found');

//   const sysId = user.sys_id;

//   const response = await fetch(`${SN_INSTANCE}/api/now/table/u_logindata/${sysId}`, {
//     method: 'PATCH',
//     headers: {
//       'Content-Type': 'application/json',
//       Accept: 'application/json',
//       Authorization: getAuthHeader(),
//     },
//     body: JSON.stringify({
//       u_password: newPassword,
//     }),
//   });

//   const data = await response.json();
//   if (!response.ok) {
//     throw new Error(data.error?.message || 'Failed to update password');
//   }
//   return data.result;
// }

// module.exports = {
//   findByEmail,
//   signup,
//   updatePassword,
// };

const fetch = require('node-fetch');

const SN_INSTANCE = 'https://dev225934.service-now.com';
const SN_USERNAME = 'reactapi';
const SN_PASSWORD = 'UConnect#2129';

const getAuthHeader = () => {
  const token = Buffer.from(`${SN_USERNAME}:${SN_PASSWORD}`).toString('base64');
  return `Basic ${token}`;
};

// Find by Email
async function findByEmail(email) {
  const response = await fetch(
    `${SN_INSTANCE}/api/now/table/u_logindata?sysparm_query=u_email=${encodeURIComponent(email)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: getAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Find failed: ${errorText}`);
  }

  const data = await response.json();
  return data.result[0];
}

// Signup (create user)
async function signup({ name, rollNo, email, password }) {
  const response = await fetch(`${SN_INSTANCE}/api/now/table/u_logindata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      u_name: name,
      u_rollno: rollNo,
      u_email: email,
      u_password: password,
      u_verified: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Signup failed');
  }

  const data = await response.json();
  return data.result;
}

// Update password
async function updatePassword(email, newPassword) {
  const user = await findByEmail(email);
  if (!user) throw new Error('User not found');

  const sysId = user.sys_id;

  const response = await fetch(`${SN_INSTANCE}/api/now/table/u_logindata/${sysId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      u_password: newPassword,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Password update failed');
  }
  return await response.json();
}

// Update verified field after OTP verified
async function markVerified(email) {
  const user = await findByEmail(email);
  if (!user) throw new Error('User not found');
  const sysId = user.sys_id;

  const response = await fetch(`${SN_INSTANCE}/api/now/table/u_logindata/${sysId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      u_verified: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Verification update failed');
  }
  return await response.json();
}

module.exports = {
  findByEmail,
  signup,
  updatePassword,
  markVerified
};
