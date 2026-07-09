const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login() {
  const res = await fetch("/api/auth", { method: "POST" });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json(); // { access_token }
}

//dont need cuz dont need to show raw history and therapy data

/*export async function getHistory() { 
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function getTherapies() {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/therapies`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}*/

export async function getAnalysis(question?: string) {
    const token = localStorage.getItem("access_token");
  
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question }),
    });
  
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const data = await res.json();
    return data.analysis as string;
  }