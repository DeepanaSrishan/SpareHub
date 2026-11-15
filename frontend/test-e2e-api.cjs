const http = require('http');

async function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== SPAREHUB COMPREHENSIVE END-TO-END TEST SUITE ===\n');

  let results = { passed: 0, failed: 0, tests: [] };

  function assert(name, condition, details = '') {
    if (condition) {
      results.passed++;
      results.tests.push({ name, status: 'PASS', details });
      console.log(`✅ [PASS] ${name}`);
    } else {
      results.failed++;
      results.tests.push({ name, status: 'FAIL', details });
      console.log(`❌ [FAIL] ${name} - ${details}`);
    }
  }

  // 1. Staff Authentication
  console.log('\n--- 1. Testing Staff Authentication ---');
  let managerToken = null;
  try {
    const res = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'manager@sparehub.lk',
      password: 'Manager@123'
    });
    const token = res.body?.data?.accessToken;
    assert('Manager Login', res.status === 200 && !!token, `Status: ${res.status}`);
    managerToken = token;
  } catch (e) {
    assert('Manager Login', false, e.message);
  }

  let salesToken = null;
  try {
    const res = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'sales@sparehub.lk',
      password: 'Sales@123'
    });
    const token = res.body?.data?.accessToken;
    assert('Sales Staff Login', res.status === 200 && !!token, `Status: ${res.status}`);
    salesToken = token;
  } catch (e) {
    assert('Sales Staff Login', false, e.message);
  }

  let inventoryToken = null;
  try {
    const res = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'inventory@sparehub.lk',
      password: 'Inventory@123'
    });
    const token = res.body?.data?.accessToken;
    assert('Inventory Staff Login', res.status === 200 && !!token, `Status: ${res.status}`);
    inventoryToken = token;
  } catch (e) {
    assert('Inventory Staff Login', false, e.message);
  }

  // 2. Customer Registration / Login
  console.log('\n--- 2. Testing Customer Registration & Flow ---');
  const testCustomerEmail = `testuser_${Date.now()}@sparehub.lk`;
  let customerToken = null;
  try {
    const res = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Test Customer',
      email: testCustomerEmail,
      phone: '0771234567',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      address: '123 Test Street, Colombo'
    });
    assert('Customer Registration', res.status === 200 || res.status === 201, `Status: ${res.status}, body: ${JSON.stringify(res.body)}`);

    // Customer Login
    const loginRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testCustomerEmail,
      password: 'Password@123'
    });
    const token = loginRes.body?.data?.accessToken;
    assert('Customer Login', loginRes.status === 200 && !!token, `Status: ${loginRes.status}`);
    customerToken = token;
  } catch (e) {
    assert('Customer Registration/Login', false, e.message);
  }

  // 3. Public / Customer Catalog API
  console.log('\n--- 3. Testing Catalog & Products API ---');
  let firstProductId = null;
  try {
    const catRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/catalog/categories',
      method: 'GET',
      headers: customerToken ? { 'Authorization': `Bearer ${customerToken}` } : {}
    });
    assert('Catalog Categories Retrieval', catRes.status === 200, `Status: ${catRes.status}`);

    const partsRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/catalog/spare-parts',
      method: 'GET',
      headers: customerToken ? { 'Authorization': `Bearer ${customerToken}` } : {}
    });
    assert('Catalog Spare Parts Retrieval', partsRes.status === 200, `Status: ${partsRes.status}`);

    const pageData = partsRes.body?.data;
    const parts = Array.isArray(pageData) ? pageData : pageData?.content || [];
    console.log(`   Found ${parts.length} catalog items.`);
    if (parts.length > 0) {
      firstProductId = parts[0].id || parts[0].partId;
      console.log(`   Selected product ID for cart test: ${firstProductId} (${parts[0].name})`);
    }
  } catch (e) {
    assert('Catalog Retrieval', false, e.message);
  }

  // 4. Customer Cart API
  console.log('\n--- 4. Testing Customer Cart API ---');
  if (customerToken) {
    try {
      const getCartRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/cart',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${customerToken}` }
      });
      assert('Customer View Cart', getCartRes.status === 200, `Status: ${getCartRes.status}`);

      if (firstProductId) {
        const addToCartRes = await request({
          hostname: 'localhost',
          port: 8080,
          path: '/api/cart/items',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${customerToken}`,
            'Content-Type': 'application/json'
          }
        }, {
          sparePartId: firstProductId,
          quantity: 1
        });
        assert('Add Item to Cart', addToCartRes.status === 200 || addToCartRes.status === 201, `Status: ${addToCartRes.status}`);

        // Place Order
        const placeOrderRes = await request({
          hostname: 'localhost',
          port: 8080,
          path: '/api/orders',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${customerToken}`,
            'Content-Type': 'application/json'
          }
        }, {
          customerNote: 'E2E Automated Test Order',
          paymentMethod: 'CASH'
        });
        assert('Place Customer Order', placeOrderRes.status === 200 || placeOrderRes.status === 201, `Status: ${placeOrderRes.status}, body: ${JSON.stringify(placeOrderRes.body)}`);

        // Get My Orders
        const myOrdersRes = await request({
          hostname: 'localhost',
          port: 8080,
          path: '/api/orders/my',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${customerToken}` }
        });
        assert('Get Customer Orders List', myOrdersRes.status === 200, `Status: ${myOrdersRes.status}`);
      }
    } catch (e) {
      assert('Customer Cart/Order Ops', false, e.message);
    }
  }

  // 5. Customer Profile & Loyalty API
  console.log('\n--- 5. Testing Profile & Loyalty API ---');
  if (customerToken) {
    try {
      const profRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/profile',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${customerToken}` }
      });
      assert('Customer Profile Retrieval', profRes.status === 200, `Status: ${profRes.status}`);

      const loyRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/loyalty/me',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${customerToken}` }
      });
      assert('Customer Loyalty Status', loyRes.status === 200, `Status: ${loyRes.status}`);
    } catch (e) {
      assert('Customer Profile/Loyalty Ops', false, e.message);
    }
  }

  // 6. Inventory Staff API
  console.log('\n--- 6. Testing Inventory Staff API ---');
  if (inventoryToken) {
    try {
      const lowStockRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/inventory/low-stock-alerts',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${inventoryToken}` }
      });
      assert('Low Stock Alerts Retrieval', lowStockRes.status === 200, `Status: ${lowStockRes.status}`);

      const partsRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/inventory/spare-parts',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${inventoryToken}` }
      });
      assert('Inventory Spare Parts List', partsRes.status === 200, `Status: ${partsRes.status}`);
    } catch (e) {
      assert('Inventory Staff API', false, e.message);
    }
  }

  // 7. Sales Staff API
  console.log('\n--- 7. Testing Sales Staff API ---');
  if (salesToken) {
    try {
      const ordersRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/staff/orders',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${salesToken}` }
      });
      assert('Sales Staff Orders Retrieval', ordersRes.status === 200, `Status: ${ordersRes.status}`);

      const custRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/staff/customers',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${salesToken}` }
      });
      assert('Sales Customers List Retrieval', custRes.status === 200, `Status: ${custRes.status}`);
    } catch (e) {
      assert('Sales Staff API', false, e.message);
    }
  }

  // 8. Manager API
  console.log('\n--- 8. Testing Manager API ---');
  if (managerToken) {
    try {
      const usersRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/manager/users',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      assert('Manager User Accounts Retrieval', usersRes.status === 200, `Status: ${usersRes.status}`);

      const reportRes = await request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/manager/reports/inventory/summary',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      assert('Manager Inventory Reports Retrieval', reportRes.status === 200, `Status: ${reportRes.status}`);
    } catch (e) {
      assert('Manager API', false, e.message);
    }
  }

  console.log('\n=======================================');
  console.log(`TOTAL TESTS: ${results.passed + results.failed}`);
  console.log(`PASSED: ${results.passed}`);
  console.log(`FAILED: ${results.failed}`);
  console.log('=======================================');
}

runTests().catch(console.error);
