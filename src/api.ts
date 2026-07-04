const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxkkFexubuo0ebWpdzTYOP-78NLhdlDjI5W6sCoznGLyqyE1PLA4ofpUdphChDBF3AbcQ/exec';

export async function fetchData(module: string, params: Record<string, string | number> = {}) {
  try {
    const url = new URL(SCRIPT_URL);
    url.searchParams.append('module', module);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    
    return data;
  } catch (error) {
    console.error(`Error fetching data for module ${module}:`, error);
    throw error;
  }
}

export async function postData(module: string, action: string, data: Record<string, unknown> = {}) {
  try {
    const userStr = localStorage.getItem('erp_user');
    let username = "Unknown";
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        username = userObj.username;
      } catch (e) {}
    }

    const payload = {
      module,
      action,
      user: username,
      ...data
    };

    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Network response was not ok');
    
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    
    return result;
  } catch (error) {
    console.error(`Error posting data for module ${module}, action ${action}:`, error);
    throw error;
  }
}
