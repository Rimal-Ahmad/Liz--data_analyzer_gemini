export async function login() {
  const res = await fetch("/api/auth", { method: "POST" });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json(); // { access_token }
}

export async function getAnalysis(question?: string) {
  
  const refreshToken = localStorage.getItem("refresh_token");
  
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-refresh-token": refreshToken ?? "",
      },
      body: JSON.stringify({ question }),
    });
  
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);

    const data = await res.json();
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }
    return data.analysis as string;
  }