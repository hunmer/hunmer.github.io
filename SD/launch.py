#@title 启用云盘部署的sd_webui
import sys
import os
import base64
import importlib.util
from IPython.display import clear_output
from google.colab import drive
drive.mount('/content/drive')

w = base64.b64decode(("d2VidWk=").encode('ascii')).decode('ascii') #webui
sdw = base64.b64decode(("c3RhYmxlLWRpZmZ1c2lvbi13ZWJ1aQ==").encode('ascii')).decode('ascii') #sdw
gwebui_dir = f'/content/drive/MyDrive/SD/{sdw}'

get_ipython().run_line_magic('cd', '/content')
get_ipython().run_line_magic('env', 'TF_CPP_MIN_LOG_LEVEL=1')

#部署 ubuntu3 环境
get_ipython().system(f'apt-get -y install -qq aria2')
get_ipython().system(f'apt -y update -qq')
get_ipython().system(f'wget http://launchpadlibrarian.net/367274644/libgoogle-perftools-dev_2.5-2.2ubuntu3_amd64.deb')
get_ipython().system(f'wget https://launchpad.net/ubuntu/+source/google-perftools/2.5-2.2ubuntu3/+build/14795286/+files/google-perftools_2.5-2.2ubuntu3_all.deb')
get_ipython().system(f'wget https://launchpad.net/ubuntu/+source/google-perftools/2.5-2.2ubuntu3/+build/14795286/+files/libtcmalloc-minimal4_2.5-2.2ubuntu3_amd64.deb')
get_ipython().system(f'wget https://launchpad.net/ubuntu/+source/google-perftools/2.5-2.2ubuntu3/+build/14795286/+files/libgoogle-perftools4_2.5-2.2ubuntu3_amd64.deb')
get_ipython().system(f'apt install -qq libunwind8-dev')
get_ipython().system(f'dpkg -i *.deb')
get_ipython().run_line_magic('env', 'LD_PRELOAD=libtcmalloc.so')
get_ipython().system(f'rm *.deb')

#部署 GPU 环境
get_ipython().system(f'apt -y install -qq aria2 libcairo2-dev pkg-config python3-dev')
get_ipython().system(f'pip install -q torch==2.0.0+cu118 torchvision==0.15.1+cu118 torchaudio==2.0.1+cu118 torchtext==0.15.1 torchdata==0.6.0 --extra-index-url https://download.pytorch.org/whl/cu118 -U')
get_ipython().system(f'pip install -q xformers==0.0.18 triton==2.0.0 -U')


clear_output()
def run(script):
    clear_output()
    get_ipython().run_line_magic('cd', f'{gwebui_dir}')
    get_ipython().system(f'python {script} --listen --enable-insecure-extension-access --theme dark --gradio-queue --multiple --opt-sdp-attention --api --cors-allow-origins=*')
run('launch.py')