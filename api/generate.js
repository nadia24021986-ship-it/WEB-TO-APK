export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Hanya menerima POST');

  const { url, appName, logo } = req.body;
  
  const GITHUB_PAT = process.env.GITHUB_PAT;
  const GITHUB_USER = process.env.GITHUB_USER; 
  const GITHUB_REPO = process.env.GITHUB_REPO; 

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'WebToAPK-App' // Wajib ada agar tidak ditolak GitHub
      },
      body: JSON.stringify({
        event_type: 'build-apk',
        client_payload: { url, appName, logo }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub merespon dengan status ${response.status}: ${errorText}`);
    }
    
    const releaseUrl = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/releases`;
    res.status(200).json({ success: true, releaseUrl: releaseUrl });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
