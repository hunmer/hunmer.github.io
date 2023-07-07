#@title 配置环境
drive_map = True #@param {type:"boolean"}
Key_words = True #@param {type:"boolean"}
Kitchen_ui = True #@param {type:"boolean"}
controlnet_switch = True #@param {type:"boolean"}

import sys
import os
import base64
import importlib.util
from IPython.display import clear_output
from google.colab import drive
drive.mount('/content/drive')

w = base64.b64decode(("d2VidWk=").encode('ascii')).decode('ascii') #webui
sdw = base64.b64decode(("c3RhYmxlLWRpZmZ1c2lvbi13ZWJ1aQ==").encode('ascii')).decode('ascii') #sdw
wb = f'/content/{sdw}'
gwb = f'/content/drive/MyDrive/{sdw}'

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

#主框架模块
get_ipython().system(f'git clone -b v2.2 https://github.com/camenduru/$sdw {wb}')
get_ipython().system(f'git clone https://huggingface.co/embed/lora {wb}/models/Lora/positive')
get_ipython().system(f'git clone https://huggingface.co/embed/negative {wb}/embeddings/negative')
get_ipython().system(f'wget https://raw.githubusercontent.com/camenduru/$sdw-scripts/main/run_n_times.py -O {wb}/scripts/run_n_times.py')
get_ipython().system(f'rm -rf {wb}/extensions/$sdw-images-browser')
get_ipython().system(f'git clone https://github.com/AlUlkesh/$sdw-images-browser {wb}/extensions/$sdw-images-browser')
get_ipython().system(f'rm -rf {wb}/extensions/sd-civitai-browser')
get_ipython().system(f'git clone https://github.com/camenduru/sd-civitai-browser {wb}/extensions/sd-civitai-browser')
get_ipython().system(f'git clone https://github.com/camenduru/sd-$w-tunnels {wb}/extensions/sd-$w-tunnels')
get_ipython().system(f'rm -rf {wb}/extensions/$sdw-catppuccin')
get_ipython().system(f'git clone https://github.com/camenduru/$sdw-catppuccin {wb}/extensions/$sdw-catppuccin')
get_ipython().system(f'git clone https://github.com/KohakuBlueleaf/a1111-sd-$w-locon {wb}/extensions/a1111-sd-$w-locon')
get_ipython().system(f'git clone https://github.com/etherealxx/batchlinks-$w {wb}/extensions/batchlinks-$w')
get_ipython().system(f'git clone https://github.com/AUTOMATIC1111/$sdw-rembg {wb}/extensions/$sdw-rembg')
get_ipython().system(f'git clone https://github.com/camenduru/sd-webui-aspect-ratio-helper {wb}/extensions/sd-$w-aspect-ratio-helper')
get_ipython().system(f'git clone https://github.com/camenduru/sd_$w_stealth_pnginfo {wb}/extensions/sd_$w_stealth_pnginfo')
get_ipython().system(f'git clone https://github.com/fkunn1326/openpose-editor {wb}/extensions/openpose-editor')
get_ipython().system(f'git clone https://github.com/hnmr293/posex {wb}/extensions/posex')
get_ipython().system(f'git clone https://github.com/nonnonstop/sd-$w-3d-open-pose-editor {wb}/extensions/sd-$w-3d-open-pose-editor')

if controlnet_switch:
    get_ipython().system(f'rm -rf {wb}/extensions/sd-$w-controlnet')
    get_ipython().system(f'git clone https://github.com/Mikubill/sd-$w-controlnet {wb}/extensions/sd-$w-controlnet')
    print("ControlNet启用")
else:
    print("ControlNet不启用")

#中文插件
get_ipython().system(f'git clone https://github.com/DominikDoom/a1111-sd-$w-tagcomplete {wb}/extensions/a1111-sd-$w-tagcomplete')
get_ipython().system(f'rm -f {wb}/extensions/a1111-sd-$w-tagcomplete/tags/danbooru.csv')
get_ipython().system(f'wget https://beehomefile.oss-cn-beijing.aliyuncs.com/20210114/danbooru.csv -O {wb}/extensions/a1111-sd-$w-tagcomplete/tags/danbooru.csv')
get_ipython().system(f'git clone https://github.com/toriato/$sdw-wd14-tagger {wb}/extensions/$sdw-wd14-tagge')
get_ipython().system(f'rm -r {wb}/localizations')
get_ipython().system(f'git clone https://github.com/dtlnor/$sdw-localization-zh_CN {wb}/extensions/$sdw-localization-zh_CN')

#Kitchen
if Kitchen_ui:
    get_ipython().system(f'git clone https://github.com/canisminor1990/sd-web-ui-kitchen-theme  {wb}/extensions/sd-web-ui-kitchen-theme')
    print("Kitchen插件启用")
else:
    print("Kitchen插件不启用")

#插件
if Key_words:
    get_ipython().system(f'git clone https://github.com/Physton/sd-$w-prompt-all-in-one  {wb}/extensions/sd-$w-prompt-all-in-one')
    print("关键词插件启用")
else:
    print("关键词插件不启用")

#配置导入
get_ipython().run_line_magic('cd', f'{wb}')
get_ipython().system(f'wget -O "config.json" "https://huggingface.co/gmk123/sd_config/raw/main/config.json"')
get_ipython().system(f'wget -O "ui-config.json" "https://huggingface.co/gmk123/sd_config/raw/main/ui-config.json"')

get_ipython().system(f'git reset --hard')
get_ipython().system(f'git -C {wb}/repositories/stable-diffusion-stability-ai reset --hard')

#ControlNet插件（可删）
if controlnet_switch:
    get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11e_sd15_ip2p_fp16.safetensors -d {wb}/extensions/sd-webui-controlnet/models -o control_v11e_sd15_ip2p_fp16.safetensors')
    get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11e_sd15_shuffle_fp16.safetensors -d {wb}/extensions/sd-webui-controlnet/models -o control_v11e_sd15_shuffle_fp16.safetensors')
    get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11p_sd15_canny_fp16.safetensors -d {wb}/extensions/sd-webui-controlnet/models -o control_v11p_sd15_canny_fp16.safetensors')
    get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11f1p_sd15_depth_fp16.safetensors -d {wb}/extensions/sd-webui-controlnet/models -o control_v11f1p_sd15_depth_fp16.safetensors')
    get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11p_sd15_inpaint_fp16.safetensors -d {wb}/extensions/sd-webui-controlnet/models -o control_v11p_sd15_inpaint_fp16.safetensors')
    get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11p_sd15_lineart_fp16.safetensors -d {wb}/extensions/sd-webui-controlnet/models -o control_v11p_sd15_lineart_fp16.safetensors')
    get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11p_sd15_mlsd_fp16.safetensors -d {wb}/extensions/sd-webui-controlnet/models -o control_v11p_sd15_mlsd_fp16.safetensors')
    get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11p_sd15_normalbae_fp16.safetensors -d {wb}/extensions/sd-webui-controlnet/models -o control_v11p_sd15_normalbae_fp16.safetensors')
    get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11p_sd15_openpose_fp16.safetensors -d {wb}/extensions/sd-webui-controlnet/models -o control_v11p_sd15_openpose_fp16.safetensors')
    get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11p_sd15_scribble_fp16.safetensors -d {wb}/extensions/sd-webui-controlnet/models -o control_v11p_sd15_scribble_fp16.safetensors')
    get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11p_sd15_seg_fp16.safetensors -d {wb}/extensions/sd-webui-controlnet/models -o control_v11p_sd15_seg_fp16.safetensors')
    get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11p_sd15_softedge_fp16.safetensors -d {wb}/extensions/sd-webui-controlnet/models -o control_v11p_sd15_softedge_fp16.safetensors')
    get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11p_sd15s2_lineart_anime_fp16.safetensors -d {wb}/extensions/sd-webui-controlnet/models -o control_v11p_sd15s2_lineart_anime_fp16.safetensors')
    get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11f1e_sd15_tile_fp16.safetensors -d {wb}/extensions/sd-webui-controlnet/models -o control_v11f1e_sd15_tile_fp16.safetensors')
    print("ControlNet启用")
else:
    print("ControlNet不启用")

#下载主模型
get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/ckpt/chilloutmix/resolve/main/chilloutmix_NiPrunedFp32Fix.safetensors -d {wb}/models/Stable-diffusion -o chilloutmix_NiPrunedFp32Fix.safetensors')

#VAE
get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/stabilityai/sd-vae-ft-mse-original/resolve/main/vae-ft-mse-840000-ema-pruned.safetensors -d {wb}/models/VAE -o vae-ft-mse-840000-ema-pruned.safetensors')

#放大
get_ipython().system(f'aria2c --console-log-level=error -c -x 16 -s 16 -k 1M https://huggingface.co/embed/upscale/resolve/main/4x-UltraSharp.pth -d {wb}/models/ESRGAN -o 4x-UltraSharp.pth')

#映射模型、lora、图库
if drive_map:
    get_ipython().system(f'mkdir -p {gwb}/models')
    get_ipython().system(f'test -d {wb}/models/Stable-diffusion && cp -r {gwb}/models {wb}/models/Stable-diffusion')

    get_ipython().system(f'mkdir -p {gwb}/lora')
    get_ipython().system(f'test -d {wb}/models/Lora && cp -r {gwb}/lora {wb}/models/Lora')

    get_ipython().system(f'mkdir -p {gwb}/outputs')
    get_ipython().system(f'test -d {wb}/outputs && cp -r {gwb}/outputs {wb}/outputs')
    print("云盘互联启用")
else:
    print("云盘互联不启用")

clear_output()

model_dir = os.path.join(wb, "models", "Stable-diffusion")
if any(f.endswith(('.ckpt', '.safetensors')) for f in os.listdir(model_dir)):
    get_ipython().system(f'sed -i \'s@weight_load_location =.*@weight_load_location = "cuda"@\' {wb}/modules/shared.py')
    get_ipython().system(f'sed -i "s@os.path.splitext(model_file)@os.path.splitext(model_file); map_location=\'cuda\'@" {wb}/modules/sd_models.py')
    get_ipython().system(f'sed -i "s@map_location=\'cpu\'@map_location=\'cuda\'@" {wb}/modules/extras.py')
    get_ipython().system(f"sed -i 's@ui.create_ui().*@ui.create_ui();shared.demo.queue(concurrency_count=999999,status_update_rate=0.1)@' {wb}/webui.py")

def run(script):
    clear_output()
    get_ipython().run_line_magic('cd', f'{wb}')
    get_ipython().system(f'python {script} --listen --enable-insecure-extension-access --theme dark --gradio-queue --multiple --opt-sdp-attention --api --cors-allow-origins=*')
    
run('launch.py')