import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Image, Dimensions, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.85;

// Estilos fora do componente
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#f8f9fa',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6c757d',
  },
  menuContainer: {
    flex: 1,
    padding: 16,
  },
  menuSection: {
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginBottom: 4,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginLeft: 12,
  },
  subMenu: {
    marginLeft: 32,
    marginTop: 8,
  },
  subMenuItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginBottom: 4,
  },
  subMenuText: {
    fontSize: 14,
    color: '#6c757d',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 20,
    marginRight: 12,
  },
  logoutContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#dc3545',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

function SidebarContent({ visible, onClose, onLogout }) {
  const Colors = useColors();

  // Estados para controlar accordions
  const [perfilExpanded, setPerfilExpanded] = useState(true);
  const [configExpanded, setConfigExpanded] = useState(false);
  const [notificacoesExpanded, setNotificacoesExpanded] = useState(false);
  const [idiomaExpanded, setIdiomaExpanded] = useState(true);
  
  // Dados do usuário
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');

  useEffect(() => {
    // Carregar dados do usuário
    AsyncStorage.getItem('nomeUsuario').then(nome => {
      if (nome) setNomeUsuario(nome);
    });
    
    AsyncStorage.getItem('emailUsuario').then(email => {
      if (email) setEmailUsuario(email);
    });
  }, []);

  const handleLogout = async () => {
    onClose();
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('keepConnected');
      console.log('Logout realizado');
      // Chamar a função de logout do componente pai
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const toggleSection = (section) => {
    switch (section) {
      case 'perfil':
        setPerfilExpanded(!perfilExpanded);
        break;
      case 'config':
        setConfigExpanded(!configExpanded);
        break;
      case 'notificacoes':
        setNotificacoesExpanded(!notificacoesExpanded);
        break;
      case 'idioma':
        setIdiomaExpanded(!idiomaExpanded);
        break;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sidebar}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            
            {/* Header do Perfil */}
            <View style={styles.profileHeader}>
              <Image 
                source={require('../assets/fotoperfil.png')} 
                style={styles.profileAvatar} 
              />
              <Text style={styles.profileName}>{nomeUsuario || 'Usuário'}</Text>
              <Text style={styles.profileEmail}>{emailUsuario || 'usuario@exemplo.com'}</Text>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
              
              {/* Perfil Section */}
              <View style={styles.menuSection}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => toggleSection('perfil')}
                >
                  <Ionicons name="person-outline" size={20} color={Colors.text} />
                  <Text style={styles.menuText}>Perfil</Text>
                  <Ionicons 
                    name={perfilExpanded ? "chevron-down" : "chevron-forward"} 
                    size={16} 
                    color={Colors.textMuted} 
                  />
                </TouchableOpacity>
                
                {perfilExpanded && (
                  <View style={styles.subMenu}>
                    <TouchableOpacity style={styles.subMenuItem}>
                      <Text style={styles.subMenuText}>Informações Pessoais</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.subMenuItem}>
                      <Text style={styles.subMenuText}>Alterar Senha</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.subMenuItem}>
                      <Text style={styles.subMenuText}>Histórico de Atividade</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Configurações Section */}
              <View style={styles.menuSection}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => toggleSection('config')}
                >
                  <Ionicons name="settings-outline" size={20} color={Colors.text} />
                  <Text style={styles.menuText}>Configurações</Text>
                  <Ionicons 
                    name={configExpanded ? "chevron-down" : "chevron-forward"} 
                    size={16} 
                    color={Colors.textMuted} 
                  />
                </TouchableOpacity>
              </View>

              {/* Notificações Section */}
              <View style={styles.menuSection}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => toggleSection('notificacoes')}
                >
                  <Ionicons name="notifications-outline" size={20} color={Colors.text} />
                  <Text style={styles.menuText}>Notificações</Text>
                  <Ionicons 
                    name={notificacoesExpanded ? "chevron-down" : "chevron-forward"} 
                    size={16} 
                    color={Colors.textMuted} 
                  />
                </TouchableOpacity>
              </View>

              {/* Idioma Section */}
              <View style={styles.menuSection}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => toggleSection('idioma')}
                >
                  <Ionicons name="language-outline" size={20} color={Colors.text} />
                  <Text style={styles.menuText}>Idioma</Text>
                  <Ionicons 
                    name={idiomaExpanded ? "chevron-down" : "chevron-forward"} 
                    size={16} 
                    color={Colors.textMuted} 
                  />
                </TouchableOpacity>
                
                {idiomaExpanded && (
                  <View style={styles.subMenu}>
                    <TouchableOpacity style={styles.subMenuItem}>
                      <View style={styles.languageItem}>
                        <Text style={styles.flag}>🇧🇷</Text>
                        <Text style={styles.subMenuText}>Português</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.subMenuItem}>
                      <View style={styles.languageItem}>
                        <Text style={styles.flag}>🇬🇧</Text>
                        <Text style={styles.subMenuText}>Inglês</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.subMenuItem}>
                      <View style={styles.languageItem}>
                        <Text style={styles.flag}>🇪🇸</Text>
                        <Text style={styles.subMenuText}>Espanhol</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Sobre Section */}
              <View style={styles.menuSection}>
                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="information-circle-outline" size={20} color={Colors.text} />
                  <Text style={styles.menuText}>Sobre a Secretar.IA</Text>
                </TouchableOpacity>
              </View>

            </View>

          </ScrollView>

          {/* Botão Sair */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>

          {/* Botão Fechar */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color={Colors.text} />
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

export default function SimpleSidebar({ visible, onClose, onLogout }) {
  return <SidebarContent visible={visible} onClose={onClose} onLogout={onLogout} />;
}
