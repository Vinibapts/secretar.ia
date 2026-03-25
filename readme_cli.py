#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Secretar.IA CLI - Leitor Interativo do README
Comando para navegar pelo README.md do projeto
"""

import os
import sys
from typing import Dict, List, Optional
import argparse

class ReadmeCLI:
    def __init__(self):
        self.readme_path = "README.md"
        self.sections = {}
        self.current_section = 0
        
    def load_readme(self) -> bool:
        """Carrega e processa o README.md"""
        if not os.path.exists(self.readme_path):
            print(f"❌ Arquivo {self.readme_path} não encontrado!")
            return False
            
        try:
            with open(self.readme_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            self.sections = self._parse_sections(content)
            return True
            
        except Exception as e:
            print(f"❌ Erro ao ler README.md: {e}")
            return False
    
    def _parse_sections(self, content: str) -> Dict[str, str]:
        """Parse do README em seções"""
        sections = {}
        lines = content.split('\n')
        current_section = "introduction"
        current_content = []
        
        for line in lines:
            # Detectar títulos de seção
            if line.startswith('## '):
                # Salvar seção anterior
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                
                # Iniciar nova seção
                section_name = line[3:].strip().lower().replace(' ', '_')
                current_section = section_name
                current_content = [line]
            elif line.startswith('# ') and current_section == "introduction":
                current_content.append(line)
            elif line.startswith('### '):
                current_content.append(line)
            else:
                current_content.append(line)
        
        # Salvar última seção
        if current_content:
            sections[current_section] = '\n'.join(current_content)
            
        return sections
    
    def show_menu(self) -> None:
        """Mostra menu de navegação"""
        print("\n" + "="*60)
        print("🤖 SECRETAR.IA - LEITOR INTERATIVO DO README")
        print("="*60)
        
        print("\n📋 SEÇÕES DISPONÍVEIS:")
        
        for i, (section_name, _) in enumerate(self.sections.items(), 1):
            emoji = self._get_section_emoji(section_name)
            display_name = section_name.replace('_', ' ').title()
            print(f"  {i}. {emoji} {display_name}")
        
        print(f"\n  0. 🚪 Sair")
        print("-"*60)
    
    def _get_section_emoji(self, section_name: str) -> str:
        """Retorna emoji para cada seção"""
        emoji_map = {
            "introduction": "🤖",
            "objetivo": "🎯",
            "funcionalidades": "✨",
            "arquitetura": "🏗️",
            "tecnologias": "🚀",
            "instalação": "📱",
            "uso": "💻",
            "sistema_de_ia": "🤖",
            "agentes_especializados": "🎯",
            "performance": "📊",
            "contribuição": "🔧",
            "licença": "📄"
        }
        return emoji_map.get(section_name, "📋")
    
    def show_section(self, section_index: int) -> None:
        """Mostra conteúdo de uma seção"""
        if section_index < 1 or section_index > len(self.sections):
            print("❌ Seção inválida!")
            return
            
        section_names = list(self.sections.keys())
        section_name = section_names[section_index - 1]
        section_content = self.sections[section_name]
        
        print(f"\n{'='*60}")
        emoji = self._get_section_emoji(section_name)
        display_name = section_name.replace('_', ' ').title()
        print(f"{emoji} {display_name.upper()}")
        print('='*60)
        
        # Mostrar conteúdo formatado
        self._display_content(section_content)
        
        print(f"\n{'='*60}")
        print("Pressione Enter para continuar...")
        input()
    
    def _display_content(self, content: str) -> None:
        """Exibe conteúdo formatado"""
        lines = content.split('\n')
        
        for line in lines:
            if line.startswith('# '):
                print(f"\n🔹 {line[2:].strip()}")
            elif line.startswith('## '):
                print(f"\n📋 {line[3:].strip()}")
            elif line.startswith('### '):
                print(f"\n   → {line[4:].strip()}")
            elif line.startswith('- '):
                print(f"   • {line[2:].strip()}")
            elif line.startswith('```'):
                print("   [Bloco de código]")
            elif line.strip().startswith('!['):
                print("   [Imagem/Link]")
            elif line.strip():
                print(f"   {line}")
    
    def show_quick_info(self) -> None:
        """Mostra informações rápidas sobre o projeto"""
        print("\n" + "="*60)
        print("🤖 SECRETAR.IA - INFORMAÇÕES RÁPIDAS")
        print("="*60)
        
        quick_info = [
            ("🎯 Objetivo", "Secretária pessoal com IA que entende português"),
            ("📱 Plataforma", "React Native + FastAPI + PostgreSQL"),
            ("✨ Principal Feature", "Comandos de voz em português"),
            ("🤖 IA", "Aprendizado contínuo e contexto personalizado"),
            ("📊 Performance", "Queries <100ms, offline-first"),
            ("🎯 Gamificação", "Pontos, ranking, streaks e conquistas"),
            ("👥 Usuários", "Escala para milhões de usuários mobile"),
            ("🔧 Agentes", "8 agentes enterprise especializados"),
            ("📚 Documentação", "README.md completo com guias")
        ]
        
        for title, description in quick_info:
            print(f"{title}: {description}")
        
        print(f"\n{'='*60}")
        print("💡 Dica: Use 'python readme_cli.py --help' para mais opções")
        print("="*60)
    
    def search_in_readme(self, term: str) -> None:
        """Busca termo no README"""
        print(f"\n🔍 Buscando por: '{term}'")
        print("-"*60)
        
        found = False
        for section_name, content in self.sections.items():
            if term.lower() in content.lower():
                print(f"\n📋 {section_name.replace('_', ' ').title()}:")
                
                # Mostrar linhas que contêm o termo
                lines = content.split('\n')
                for i, line in enumerate(lines, 1):
                    if term.lower() in line.lower():
                        print(f"   Linha {i}: {line.strip()}")
                        found = True
        
        if not found:
            print(f"❌ Termo '{term}' não encontrado no README.")
        
        print("-"*60)
    
    def run_interactive(self) -> None:
        """Executa modo interativo"""
        if not self.load_readme():
            return
        
        while True:
            self.show_menu()
            
            try:
                choice = input("\n👉 Escolha uma opção (0-{}): ".format(len(self.sections)))
                
                if choice == '0':
                    print("👋 Até logo!")
                    break
                elif choice.isdigit():
                    self.show_section(int(choice))
                else:
                    print("❌ Opção inválida! Tente novamente.")
                    
            except KeyboardInterrupt:
                print("\n👋 Até logo!")
                break
            except Exception as e:
                print(f"❌ Erro: {e}")

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description="Secretar.IA CLI - Leitor Interativo do README",
        epilog="Exemplo: python readme_cli.py --search 'IA'"
    )
    
    parser.add_argument(
        '--quick', '-q',
        action='store_true',
        help='Mostrar informações rápidas sobre o projeto'
    )
    
    parser.add_argument(
        '--search', '-s',
        type=str,
        help='Buscar termo específico no README'
    )
    
    parser.add_argument(
        '--section', '-c',
        type=int,
        help='Mostrar seção específica (número)'
    )
    
    args = parser.parse_args()
    
    cli = ReadmeCLI()
    
    if args.quick:
        cli.show_quick_info()
    elif args.search:
        if cli.load_readme():
            cli.search_in_readme(args.search)
    elif args.section:
        if cli.load_readme():
            cli.show_section(args.section)
    else:
        cli.run_interactive()

if __name__ == "__main__":
    main()
