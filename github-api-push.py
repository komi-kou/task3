#!/usr/bin/env python3
import os
import sys
import base64
import json
import subprocess

def create_github_file_via_api():
    """GitHub APIを使用してファイルを直接作成/更新"""
    
    print("🔄 GitHub API経由でファイルを更新中...")
    
    # 重要なファイルの内容を読み取り
    files_to_update = {
        'app/layout.tsx': 'app/layout.tsx',
        'prisma/schema.production.prisma': 'prisma/schema.production.prisma',
        'package.json': 'package.json',
        'render.yaml': 'render.yaml'
    }
    
    repo = "komi-kou/task3"
    
    for file_path, local_path in files_to_update.items():
        if os.path.exists(local_path):
            with open(local_path, 'r') as f:
                content = f.read()
                encoded = base64.b64encode(content.encode()).decode()
                
            print(f"📁 {file_path}: {len(content)} bytes")
            
            # cURLコマンドを生成（トークンが必要）
            curl_cmd = f"""
curl -X PUT "https://api.github.com/repos/{repo}/contents/{file_path}" \\
  -H "Accept: application/vnd.github.v3+json" \\
  -H "Authorization: token YOUR_GITHUB_TOKEN" \\
  -d '{{"message":"Auto-fix deployment issues","content":"{encoded[:100]}..."}}'
"""
            print(f"コマンド例:\n{curl_cmd}\n")

# 実行
if __name__ == "__main__":
    print("📋 GitHub APIを使用した直接更新の準備")
    print("=" * 50)
    create_github_file_via_api()
    
    print("\n⚠️ 注意: GitHub Personal Access Tokenが必要です")
    print("1. https://github.com/settings/tokens/new で作成")
    print("2. 'repo' スコープを選択")
    print("3. 上記のコマンドでYOUR_GITHUB_TOKENを置き換えて実行")