"""Forward only PICUI API calls over the configured SSH connection."""
import base64
import hashlib
import json
import shlex
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")
sys.stdin.reconfigure(encoding="utf-8")

REMOTE = r'''
import base64,hashlib,json,secrets,sys,urllib.request,urllib.error,urllib.parse
data=json.load(sys.stdin)
if data.get('verifyUrl'):
 url=urllib.parse.urlsplit(data['verifyUrl'])
 if url.scheme!='https' or url.hostname!='cdn.imgos.cn' or not url.path.startswith('/vip/19936/') or url.username or url.password or url.query:
  raise ValueError('Unsupported image URL')
 with urllib.request.urlopen(urllib.request.Request(data['verifyUrl'],headers={'Accept':'image/*','User-Agent':'Mozilla/5.0'}),timeout=120) as response:
  digest=hashlib.sha256();size=0
  while True:
   chunk=response.read(131072)
   if not chunk:break
   digest.update(chunk);size+=len(chunk)
  print(json.dumps({'status':response.status,'hash':digest.hexdigest(),'bytes':size,'contentType':response.headers.get('Content-Type','')}))
 sys.exit(0)
endpoint=data['endpoint']
if endpoint not in ('/profile','/upload') and not endpoint.startswith('/images?page='):
 raise ValueError('Unsupported PICUI endpoint')
headers={'Accept':'application/json','Authorization':'Bearer '+data['token']}
body=None
if data.get('upload'):
 image=data['upload']
 boundary='picui-'+secrets.token_hex(16)
 name=image['filename'].replace('"','_').replace('\\','_').replace('\r','_').replace('\n','_')
 body=('--'+boundary+'\r\nContent-Disposition: form-data; name="permission"\r\n\r\n1\r\n--'+boundary+'\r\nContent-Disposition: form-data; name="file"; filename="'+name+'"\r\nContent-Type: '+image['mimeType']+'\r\n\r\n').encode()+base64.b64decode(image['bytes'])+('\r\n--'+boundary+'--\r\n').encode()
 headers['Content-Type']='multipart/form-data; boundary='+boundary
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
opener=urllib.request.build_opener(NoRedirect())
request=urllib.request.Request('https://picui.cn/api/v1'+endpoint,data=body,headers=headers)
try:
 response=opener.open(request,timeout=90)
except urllib.error.HTTPError as error:
 response=error
with response:
 try: result=json.load(response)
 except ValueError: result={'status':False}
 print(json.dumps({'status':response.status,'body':result}))
'''


def main():
    data = json.load(sys.stdin)
    ssh = data.pop("ssh")
    if not all(ssh.get(key) for key in ("host", "username", "password", "fingerprint")):
        raise ValueError("Incomplete SSH configuration")
    import paramiko

    class VerifyHost(paramiko.MissingHostKeyPolicy):
        def missing_host_key(self, client, hostname, key):
            fingerprint = base64.b64encode(hashlib.sha256(key.asbytes()).digest()).decode().rstrip("=")
            if fingerprint != ssh["fingerprint"].removeprefix("SHA256:"):
                raise ValueError("SSH host key mismatch")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(VerifyHost())
    try:
        client.connect(ssh["host"], username=ssh["username"], password=ssh["password"],
                       timeout=20, allow_agent=False, look_for_keys=False)
        stdin, stdout, stderr = client.exec_command("python3 -c " + shlex.quote(REMOTE), timeout=100)
        stdin.write(json.dumps(data))
        stdin.channel.shutdown_write()
        output = stdout.read().decode("utf-8")
        stderr.read()
        if stdout.channel.recv_exit_status() != 0:
            raise ValueError("Remote API request failed")
        json.loads(output)
        print(output, end="")
    finally:
        client.close()


try:
    main()
except ImportError:
    print("PICUI SSH 转发需要 Python 的 paramiko 包。", file=sys.stderr)
    sys.exit(1)
except Exception as error:
    print(f"PICUI SSH 转发失败（{type(error).__name__}），请检查服务器连接、指纹和上传配置。", file=sys.stderr)
    sys.exit(1)
