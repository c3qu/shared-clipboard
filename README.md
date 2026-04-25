# 共享剪贴板

一个简单的在线共享剪贴板应用，支持多人共享文本内容。

## 功能特性

- 🔐 **密码保护** - 访问需要密码验证
- 📄 **文件共享** - 支持上传和下载文件，带文件图标显示
- 📋 **点击复制** - 点击任意内容行即可复制到剪贴板
- ⌨️ **快捷键支持** - 按 `Ctrl+V` 直接粘贴文本或文件
- 🔄 **实时同步** - 自动刷新显示最新内容
- 💾 **数据持久化** - 数据和文件都保存到磁盘
- 🐳 **Docker部署** - 支持一键Docker部署

## 本地运行

### 方式1: Python虚拟环境运行

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows (Git Bash):
source venv/Scripts/activate
# Windows (CMD):
venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 设置密码（可选，默认是 123456）
# Windows (Git Bash):
export ACCESS_PASSWORD=yourpassword
# Linux/Mac:
export ACCESS_PASSWORD=yourpassword

# 设置最大文件大小（可选，默认50MB，单位字节）
export MAX_FILE_SIZE=52428800

# 启动服务
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

默认访问密码: `123456`
访问: http://localhost:8080

### 方式2: Docker运行

```bash
# 构建并启动
docker compose up -d

# 查看日志
docker compose logs -f

# 停止
docker compose down
```

访问: http://localhost:8080

## API接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/items` | 获取所有剪贴板内容 |
| POST | `/api/items` | 添加新内容 (JSON: {"content": "..."}) |
| DELETE | `/api/items/{id}` | 删除指定内容 |

## 项目结构

```
jianqieban/
├── app/
│   ├── main.py          # FastAPI主程序
│   ├── storage.py       # 数据存储逻辑
│   └── static/
│       ├── index.html   # 前端页面
│       ├── style.css    # 样式文件
│       └── app.js       # 前端交互逻辑
├── data/                # 数据持久化目录 (自动创建)
├── Dockerfile           # Docker镜像配置
├── docker-compose.yml   # Docker Compose配置
└── requirements.txt     # Python依赖
```

## 使用说明

1. **添加内容**: 点击"粘贴新内容"按钮，或直接按 `Ctrl+V`
2. **复制内容**: 点击任意一行内容，自动复制到剪贴板
3. **删除内容**: 鼠标悬停在内容上，点击右侧的 × 按钮
