import React, { useState, useEffect } from 'react';
import { Car, Bike, Package, Truck, Briefcase, MapPin, DollarSign, Calendar, TrendingUp, Copy, Check, Navigation, Settings, Calculator, FileText, Eye, Clock, User, Phone, MessageSquare, X, Plus, LogIn, LogOut } from 'lucide-react';

// ============= MOTORISTAS CADASTRADOS =============
const DRIVERS = [
  { id: 'M001', username: 'motorista1', password: 'senha123', name: 'João Silva' },
  { id: 'M002', username: 'motorista2', password: 'senha123', name: 'Maria Santos' },
  { id: 'M003', username: 'motorista3', password: 'senha123', name: 'Pedro Costa' },
  { id: 'M004', username: 'motorista4', password: 'senha123', name: 'Ana Lima' },
  { id: 'M005', username: 'motorista5', password: 'senha123', name: 'Carlos Souza' },
  { id: 'M006', username: 'motorista6', password: 'senha123', name: 'Juliana Alves' },
  { id: 'M007', username: 'motorista7', password: 'senha123', name: 'Roberto Dias' },
  { id: 'M008', username: 'motorista8', password: 'senha123', name: 'Fernanda Rocha' },
  { id: 'M009', username: 'motorista9', password: 'senha123', name: 'Paulo Martins' },
  { id: 'M010', username: 'motorista10', password: 'senha123', name: 'Luciana Ferreira' }
];

const EloMob = () => {
  // AUTENTICAÇÃO
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Estados principais
  const [isAvailable, setIsAvailable] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('driver'); // 'driver' ou 'passenger'
  
  // Configurações
  const [settings, setSettings] = useState({
    pricePerKm: 2.50,
    minimumPrice: 8.00,
    maxRadius: 15,
    fuelCostPerKm: 0.60,
    vehicleModel: 'Gol 1.0',
    licensePlate: 'ABC-1234',
    autoRespondPrice: true
  });

  // Tipo de serviço
  const [serviceType, setServiceType] = useState('car-passenger');
  
  // Configuração de trajeto
  const [routeConfig, setRouteConfig] = useState({
    type: 'free',
    fixedOrigin: '',
    fixedDestination: '',
    fixedDepartureTime: '',
    neighborhoods: [],
    cities: [],
    tempNeighborhood: '',
    tempCity: ''
  });

  // Localização
  const [driverLocation, setDriverLocation] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [isSimulatingGPS, setIsSimulatingGPS] = useState(false);

  // Corridas e solicitações
  const [rides, setRides] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [priceQueries, setPriceQueries] = useState([]);
  
  // Ganhos
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });

  // Templates de mensagens
  const [showTemplates, setShowTemplates] = useState(false);

  // Estado da calculadora
  const [calculator, setCalculator] = useState({ distance: '', result: null });

  // Estado do passageiro
  const [passengerQuery, setPassengerQuery] = useState({
    step: 1, // 1: form, 2: waiting, 3: answered
    name: '',
    from: '',
    to: '',
    estimatedDistance: 0,
    price: null,
    queryId: null
  });

  // Copiar status
  const [copied, setCopied] = useState(false);

  // Tipos de serviço disponíveis
  const serviceTypes = {
    'car-passenger': {
      icon: Car,
      color: 'blue',
      label: 'Carro para Passageiros',
      description: 'Transporte de pessoas em carro',
      statusTitle: 'Motorista Disponível'
    },
    'moto-passenger': {
      icon: Bike,
      color: 'orange',
      label: 'Moto para Passageiros',
      description: 'Transporte de pessoas em moto',
      statusTitle: 'Moto Disponível'
    },
    'motoboy': {
      icon: Package,
      color: 'green',
      label: 'Motoboy - Entregas',
      description: 'Entregas de encomendas, documentos e pequenos volumes',
      statusTitle: 'Moto Disponível'
    },
    'frete': {
      icon: Truck,
      color: 'purple',
      label: 'Fretes com Carro/Utilitário',
      description: 'Transporte de cargas, mudanças e volumes maiores',
      statusTitle: 'Serviço Frete Disponível'
    },
    'office-boy': {
      icon: Briefcase,
      color: 'gray',
      label: 'Office Boy',
      description: 'Serviços gerais (ônibus, bicicleta, a pé)',
      statusTitle: 'Office Boy Disponível'
    }
  };

  // Templates de mensagens
  const messageTemplates = [
    "Cheguei no local",
    "5 minutos de atraso",
    "10 minutos de atraso",
    "A caminho",
    "Confirmar endereço",
    "Obrigado pela corrida"
  ];

  // ============= FUNÇÕES DE AUTENTICAÇÃO =============
  
  const handleLogin = () => {
    const driver = DRIVERS.find(
      d => d.username === loginForm.username && d.password === loginForm.password
    );
    
    if (driver) {
      setCurrentUser(driver);
      setLoginError('');
    } else {
      setLoginError('Usuário ou senha incorretos');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ username: '', password: '' });
    setIsAvailable(false);
    setSessionId('');
    stopLocationTracking();
  };

  // Gerar ID único
  const generateSessionId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  };

  // Toggle disponibilidade
  const toggleAvailability = () => {
    if (!isAvailable) {
      const newId = generateSessionId();
      setSessionId(newId);
      setIsAvailable(true);
      startLocationTracking();
    } else {
      setIsAvailable(false);
      setSessionId('');
      stopLocationTracking();
    }
  };

  // Renovar link
  const renewLink = () => {
    const newId = generateSessionId();
    setSessionId(newId);
  };

  // Descrição do trajeto
  const getRouteDescription = () => {
    switch (routeConfig.type) {
      case 'fixed':
        const timeText = routeConfig.fixedDepartureTime 
          ? `Saída estimada: ${routeConfig.fixedDepartureTime}`
          : 'Saída estimada: A combinar';
        return `${routeConfig.fixedOrigin || 'Origem'} → ${routeConfig.fixedDestination || 'Destino'} • ${timeText}`;
      case 'neighborhoods':
        return routeConfig.neighborhoods.length > 0
          ? `Bairros: ${routeConfig.neighborhoods.join(', ')}`
          : 'Nenhum bairro configurado';
      case 'cities':
        return routeConfig.cities.length > 0
          ? `Cidades: ${routeConfig.cities.join(', ')}`
          : 'Nenhuma cidade configurada';
      case 'free':
        return 'Trajeto livre (qualquer destino)';
      default:
        return 'Não configurado';
    }
  };

  // Gerar texto do Status do WhatsApp
  const generateWhatsAppStatus = () => {
    const service = serviceTypes[serviceType];
    const route = getRouteDescription();
    const link = `https://elomob.com/${sessionId}`;
    
    return `*${service.statusTitle}* 🚗

${route}

Acesse: ${link}

🔒 _Link exclusivo para meus contatos_`;
  };

  // Copiar texto
  const copyWhatsAppStatus = () => {
    const text = generateWhatsAppStatus();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Rastreamento GPS
  const startLocationTracking = () => {
    setGpsError(null);
    
    if (!navigator.geolocation) {
      setGpsError('Seu navegador não suporta geolocalização');
      return;
    }

    setIsTrackingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDriverLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toLocaleTimeString('pt-BR')
        });
        setGpsError(null);
        
        // Continuar rastreando
        navigator.geolocation.watchPosition(
          (pos) => {
            setDriverLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              timestamp: new Date().toLocaleTimeString('pt-BR')
            });
          },
          (error) => {
            console.error('Erro GPS:', error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      },
      (error) => {
        let errorMsg = 'Erro ao obter localização';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Você negou a permissão de localização. Permita nas configurações do navegador ou use o modo simulado.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Localização indisponível no momento.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Tempo esgotado ao tentar obter localização.';
            break;
        }
        
        setGpsError(errorMsg);
        setIsTrackingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const stopLocationTracking = () => {
    setIsTrackingLocation(false);
    setDriverLocation(null);
    setGpsError(null);
    setIsSimulatingGPS(false);
  };

  // Simular GPS para testes
  const simulateGPS = () => {
    setIsSimulatingGPS(true);
    setIsTrackingLocation(true);
    setGpsError(null);
    
    // Coordenadas de Maringá, PR (exemplo)
    const baseLatitude = -23.4205;
    const baseLongitude = -51.9333;
    
    const updateSimulatedLocation = () => {
      setDriverLocation({
        lat: baseLatitude + (Math.random() - 0.5) * 0.01,
        lng: baseLongitude + (Math.random() - 0.5) * 0.01,
        accuracy: Math.random() * 20 + 10,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        simulated: true
      });
    };
    
    updateSimulatedLocation();
    
    // Atualizar a cada 3 segundos
    const interval = setInterval(updateSimulatedLocation, 3000);
    return () => clearInterval(interval);
  };

  // Aceitar corrida
  const acceptRide = (id) => {
    const request = pendingRequests.find(r => r.id === id);
    if (request) {
      const newRide = {
        ...request,
        date: new Date().toLocaleDateString('pt-BR'),
        dateTime: new Date().toLocaleString('pt-BR'),
        actualPrice: request.suggestedPrice
      };
      setRides([...rides, newRide]);
      setPendingRequests(pendingRequests.filter(r => r.id !== id));
      
      // Atualizar ganhos
      setEarnings({
        today: earnings.today + request.suggestedPrice,
        week: earnings.week + request.suggestedPrice,
        month: earnings.month + request.suggestedPrice
      });
    }
  };

  // Recusar corrida
  const rejectRide = (id) => {
    setPendingRequests(pendingRequests.filter(r => r.id !== id));
  };

  // Abrir WhatsApp
  const openWhatsApp = (phone, message) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/55${cleanPhone}?text=${encodedMessage}`, '_blank');
  };

  // Calcular preço
  const calculatePrice = (distance) => {
    const basePrice = distance * settings.pricePerKm;
    const price = Math.max(basePrice, settings.minimumPrice);
    const fuelCost = distance * settings.fuelCostPerKm;
    const profit = price - fuelCost;
    return { price: price.toFixed(2), fuelCost: fuelCost.toFixed(2), profit: profit.toFixed(2) };
  };

  // Passageiro: Submeter consulta de preço
  const submitPriceQuery = () => {
    const distance = Math.random() * 10 + 2; // Simulação
    const calculated = calculatePrice(distance);
    
    const newQuery = {
      id: Date.now(),
      passenger: passengerQuery.name,
      from: passengerQuery.from,
      to: passengerQuery.to,
      estimatedDistance: distance.toFixed(1),
      status: settings.autoRespondPrice ? 'answered' : 'pending',
      driverResponse: settings.autoRespondPrice ? parseFloat(calculated.price) : null,
      timestamp: new Date().toLocaleTimeString('pt-BR')
    };

    setPriceQueries([...priceQueries, newQuery]);
    
    if (settings.autoRespondPrice) {
      setPassengerQuery({
        ...passengerQuery,
        step: 3,
        estimatedDistance: distance,
        price: parseFloat(calculated.price),
        queryId: newQuery.id
      });
    } else {
      setPassengerQuery({
        ...passengerQuery,
        step: 2,
        estimatedDistance: distance,
        queryId: newQuery.id
      });
    }
  };

  // Motorista: Responder consulta de preço
  const respondPriceQuery = (id, price) => {
    const updated = priceQueries.map(q => 
      q.id === id ? { ...q, status: 'answered', driverResponse: price } : q
    );
    setPriceQueries(updated);

    // Se for a consulta atual do passageiro, atualizar
    if (passengerQuery.queryId === id) {
      setPassengerQuery({
        ...passengerQuery,
        step: 3,
        price: price
      });
    }
  };

  // Adicionar bairro
  const addNeighborhood = () => {
    if (routeConfig.tempNeighborhood && routeConfig.neighborhoods.length < 6) {
      setRouteConfig({
        ...routeConfig,
        neighborhoods: [...routeConfig.neighborhoods, routeConfig.tempNeighborhood],
        tempNeighborhood: ''
      });
    }
  };

  // Adicionar cidade
  const addCity = () => {
    if (routeConfig.tempCity && routeConfig.cities.length < 4) {
      setRouteConfig({
        ...routeConfig,
        cities: [...routeConfig.cities, routeConfig.tempCity],
        tempCity: ''
      });
    }
  };

  // Remover bairro
  const removeNeighborhood = (index) => {
    setRouteConfig({
      ...routeConfig,
      neighborhoods: routeConfig.neighborhoods.filter((_, i) => i !== index)
    });
  };

  // Remover cidade
  const removeCity = (index) => {
    setRouteConfig({
      ...routeConfig,
      cities: routeConfig.cities.filter((_, i) => i !== index)
    });
  };

  // RENDER: Dashboard do Motorista
  const renderDriverDashboard = () => (
    <div className="space-y-4">
      {/* Status de Disponibilidade */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Status de Disponibilidade</h2>
        
        <button
          onClick={toggleAvailability}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition ${
            isAvailable ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'
          }`}
        >
          {isAvailable ? '✓ DISPONÍVEL' : 'INDISPONÍVEL'}
        </button>

        {isAvailable && (
          <div className="mt-4 space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-gray-700">Link Único:</span>
                <button
                  onClick={renewLink}
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Renovar Link
                </button>
              </div>
              <code className="text-sm text-blue-600 break-all">
                https://elomob.com/{sessionId}
              </code>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-xs text-yellow-800">
                🔒 <strong>Segurança:</strong> Link muda toda vez que você fica disponível. Para bloquear alguém, remova da lista de privacidade do Status do WhatsApp.
              </p>
            </div>

            <div className="border rounded p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Texto para Status do WhatsApp:</span>
                <button
                  onClick={copyWhatsAppStatus}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                    copied ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <pre className="text-sm bg-white p-3 rounded border whitespace-pre-wrap">
                {generateWhatsAppStatus()}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Tipo de Serviço */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Tipo de Serviço</h2>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(serviceTypes).map(([key, service]) => {
            const Icon = service.icon;
            const isSelected = serviceType === key;
            return (
              <button
                key={key}
                onClick={() => setServiceType(key)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`text-${service.color}-500`} size={24} />
                <div className="text-left flex-1">
                  <div className="font-semibold">{service.label}</div>
                  <div className="text-sm text-gray-600">{service.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuração de Trajeto */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Tipo de Atendimento</h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            {[
              { key: 'fixed', label: 'Trajeto Fixo' },
              { key: 'neighborhoods', label: 'Bairros' },
              { key: 'cities', label: 'Cidades' },
              { key: 'free', label: 'Livre' }
            ].map(option => (
              <button
                key={option.key}
                onClick={() => setRouteConfig({ ...routeConfig, type: option.key })}
                className={`px-4 py-2 rounded transition ${
                  routeConfig.type === option.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {routeConfig.type === 'fixed' && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Origem"
                value={routeConfig.fixedOrigin}
                onChange={(e) => setRouteConfig({ ...routeConfig, fixedOrigin: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Destino"
                value={routeConfig.fixedDestination}
                onChange={(e) => setRouteConfig({ ...routeConfig, fixedDestination: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="time"
                value={routeConfig.fixedDepartureTime}
                onChange={(e) => setRouteConfig({ ...routeConfig, fixedDepartureTime: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
          )}

          {routeConfig.type === 'neighborhoods' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome do bairro"
                  value={routeConfig.tempNeighborhood}
                  onChange={(e) => setRouteConfig({ ...routeConfig, tempNeighborhood: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addNeighborhood()}
                  className="flex-1 px-4 py-2 border rounded"
                />
                <button
                  onClick={addNeighborhood}
                  disabled={routeConfig.neighborhoods.length >= 6}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {routeConfig.neighborhoods.map((neighborhood, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2">
                    {neighborhood}
                    <button onClick={() => removeNeighborhood(index)} className="hover:text-blue-600">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500">Máximo: 6 bairros</p>
            </div>
          )}

          {routeConfig.type === 'cities' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome da cidade"
                  value={routeConfig.tempCity}
                  onChange={(e) => setRouteConfig({ ...routeConfig, tempCity: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addCity()}
                  className="flex-1 px-4 py-2 border rounded"
                />
                <button
                  onClick={addCity}
                  disabled={routeConfig.cities.length >= 4}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {routeConfig.cities.map((city, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2">
                    {city}
                    <button onClick={() => removeCity(index)} className="hover:text-green-600">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500">Máximo: 4 cidades</p>
            </div>
          )}

          <div className="bg-gray-100 p-3 rounded">
            <p className="text-sm font-semibold mb-1">Configuração atual:</p>
            <p className="text-sm text-gray-700">{getRouteDescription()}</p>
          </div>
        </div>
      </div>

      {/* Rastreamento GPS */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Rastreamento de Localização (GPS)</h2>
        
        <div className="space-y-3">
          <button
            onClick={isTrackingLocation ? stopLocationTracking : startLocationTracking}
            disabled={!isAvailable}
            className={`w-full py-3 px-6 rounded-lg font-bold text-white transition ${
              !isAvailable
                ? 'bg-gray-300 cursor-not-allowed'
                : isTrackingLocation
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isTrackingLocation ? 'Pausar Rastreamento' : 'Ativar Rastreamento GPS Real'}
          </button>

          <button
            onClick={simulateGPS}
            disabled={!isAvailable || isTrackingLocation}
            className="w-full py-3 px-6 rounded-lg font-bold bg-purple-500 text-white hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            🎮 Simular GPS (para testes)
          </button>
        </div>

        {gpsError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded p-4">
            <p className="text-sm text-red-800 font-semibold mb-2">⚠️ Erro no GPS:</p>
            <p className="text-sm text-red-700">{gpsError}</p>
            <p className="text-xs text-red-600 mt-2">💡 Dica: Use o botão "Simular GPS" para testar o protótipo</p>
          </div>
        )}

        {driverLocation && (
          <div className="mt-4 space-y-2">
            <div className={`${driverLocation.simulated ? 'bg-purple-50 border-purple-200' : 'bg-green-50 border-green-200'} border rounded p-3`}>
              <div className="flex items-center gap-2 mb-2">
                <Navigation className={driverLocation.simulated ? 'text-purple-600' : 'text-green-600'} size={20} />
                <span className={`font-semibold ${driverLocation.simulated ? 'text-purple-800' : 'text-green-800'}`}>
                  {driverLocation.simulated ? 'Localização Simulada' : 'Localização Ativa'}
                </span>
              </div>
              <div className="text-sm space-y-1">
                <p>📍 Lat: {driverLocation.lat.toFixed(6)}</p>
                <p>📍 Lng: {driverLocation.lng.toFixed(6)}</p>
                <p>🎯 Precisão: {driverLocation.accuracy.toFixed(0)}m</p>
                <p>🕐 Atualizado: {driverLocation.timestamp}</p>
              </div>
            </div>
            <div className="bg-gray-100 rounded p-3 text-center text-sm text-gray-600">
              🗺️ Mapa seria exibido aqui (Google Maps API necessária)
            </div>
          </div>
        )}

        {!isTrackingLocation && !gpsError && isAvailable && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-800">
              ℹ️ <strong>Instruções:</strong><br/>
              • <strong>GPS Real:</strong> O navegador pedirá permissão para acessar sua localização<br/>
              • <strong>GPS Simulado:</strong> Use para testar sem precisar de permissão (localização fictícia em Maringá)
            </p>
          </div>
        )}
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-green-500" size={20} />
            <span className="text-sm font-semibold">Hoje</span>
          </div>
          <p className="text-2xl font-bold text-green-600">R$ {earnings.today.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-blue-500" size={20} />
            <span className="text-sm font-semibold">Semana</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">R$ {earnings.week.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-purple-500" size={20} />
            <span className="text-sm font-semibold">Mês</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">R$ {earnings.month.toFixed(2)}</p>
        </div>
      </div>

      {/* Solicitações Pendentes */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Solicitações de Carona Pendentes</h2>
          <div className="space-y-4">
            {pendingRequests.map(request => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{request.passenger}</p>
                    <p className="text-sm text-gray-600">{request.phone}</p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {request.time}
                  </span>
                </div>
                <div className="mb-3 space-y-1">
                  <p className="text-sm">📍 <strong>De:</strong> {request.from}</p>
                  <p className="text-sm">📍 <strong>Para:</strong> {request.to}</p>
                  <p className="text-sm">📏 <strong>Distância:</strong> {request.distance}</p>
                  <p className="text-sm text-green-600 font-semibold">💰 R$ {request.suggestedPrice.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openWhatsApp(request.phone, `Olá ${request.passenger}! Vi sua solicitação de corrida.`)}
                    className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => acceptRide(request.id)}
                    className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => rejectRide(request.id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consultas de Preço */}
      {!settings.autoRespondPrice && priceQueries.filter(q => q.status === 'pending').length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Consultas de Preço Pendentes</h2>
          <div className="space-y-4">
            {priceQueries.filter(q => q.status === 'pending').map(query => {
              const [customPrice, setCustomPrice] = useState('');
              return (
                <div key={query.id} className="border rounded-lg p-4">
                  <p className="font-semibold mb-2">{query.passenger}</p>
                  <p className="text-sm mb-2">📍 {query.from} → {query.to}</p>
                  <p className="text-sm mb-2">📏 ~{query.estimatedDistance} km</p>
                  <p className="text-sm text-green-600 mb-3">💰 Sugerido: R$ {calculatePrice(parseFloat(query.estimatedDistance)).price}</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.50"
                      placeholder="Preço customizado"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded"
                    />
                    <button
                      onClick={() => {
                        const price = customPrice ? parseFloat(customPrice) : parseFloat(calculatePrice(parseFloat(query.estimatedDistance)).price);
                        respondPriceQuery(query.id, price);
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {settings.autoRespondPrice && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            ℹ️ <strong>Resposta Automática Ativada:</strong> Consultas de preço são respondidas automaticamente com base nas suas configurações.
          </p>
        </div>
      )}

      {/* Histórico do Dia */}
      {rides.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Corridas Realizadas Hoje ({rides.length})</h2>
          <div className="space-y-3">
            {rides.map((ride, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-semibold">{ride.passenger}</p>
                <p className="text-sm text-gray-600">{ride.from} → {ride.to}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm">{ride.distance} • {ride.time}</span>
                  <span className="text-green-600 font-semibold">R$ {ride.actualPrice.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates de Mensagens */}
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full flex items-center justify-between py-2"
        >
          <h2 className="text-xl font-bold">Templates de Mensagens Rápidas</h2>
          <span className="text-2xl">{showTemplates ? '−' : '+'}</span>
        </button>
        
        {showTemplates && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {messageTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => {
                  navigator.clipboard.writeText(template);
                  alert(`Copiado: "${template}"`);
                }}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded text-sm text-left flex items-center justify-between"
              >
                <span>{template}</span>
                <Copy size={14} className="text-gray-500" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // RENDER: Visão do Passageiro
  const renderPassengerView = () => {
    if (!isAvailable) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <Car className="mx-auto text-gray-400 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-700 mb-2">Motorista Indisponível</h1>
            <p className="text-gray-600">O motorista não está aceitando caronas no momento.</p>
          </div>
        </div>
      );
    }

    const service = serviceTypes[serviceType];
    const Icon = service.icon;

    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Header */}
          <div className="bg-green-500 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4 mb-2">
              <Icon size={40} />
              <div>
                <h1 className="text-2xl font-bold">Motorista Disponível!</h1>
                <p className="text-green-100">{settings.vehicleModel} • {settings.licensePlate}</p>
              </div>
            </div>
          </div>

          {/* Tipo de Serviço */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-bold mb-2 flex items-center gap-2">
              <Icon className={`text-${service.color}-500`} size={20} />
              {service.label}
            </h2>
            <p className="text-sm text-gray-600">{service.description}</p>
          </div>

          {/* Tipo de Atendimento */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-bold mb-2">Tipo de Atendimento</h2>
            <p className="text-gray-700 mb-2">{getRouteDescription()}</p>
            
            {routeConfig.type === 'fixed' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                ⚠️ Este motorista só atende o trajeto acima
              </div>
            )}
            {routeConfig.type === 'neighborhoods' && routeConfig.neighborhoods.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                ⚠️ Só atende dentro desses bairros
              </div>
            )}
            {routeConfig.type === 'cities' && routeConfig.cities.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                ⚠️ Só atende essas cidades
              </div>
            )}
            {routeConfig.type === 'free' && (
              <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
                ✓ Atende qualquer trajeto (raio: {settings.maxRadius} km)
              </div>
            )}
          </div>

          {/* Formulário de Consulta */}
          {passengerQuery.step === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-bold text-lg mb-4">Consultar Preço</h2>
              
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Seu Nome"
                  value={passengerQuery.name}
                  onChange={(e) => setPassengerQuery({ ...passengerQuery, name: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="De onde você sai?"
                  value={passengerQuery.from}
                  onChange={(e) => setPassengerQuery({ ...passengerQuery, from: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Para onde você vai?"
                  value={passengerQuery.to}
                  onChange={(e) => setPassengerQuery({ ...passengerQuery, to: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div className="bg-gray-50 rounded p-3 mb-4 text-sm">
                <p className="font-semibold mb-1">Tabela do Motorista:</p>
                <p>• Preço por km: R$ {settings.pricePerKm.toFixed(2)}</p>
                <p>• Preço mínimo: R$ {settings.minimumPrice.toFixed(2)}</p>
              </div>

              <button
                onClick={submitPriceQuery}
                disabled={!passengerQuery.name || !passengerQuery.from || !passengerQuery.to}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Consultar Preço
              </button>
            </div>
          )}

          {/* Aguardando Resposta */}
          {passengerQuery.step === 2 && (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="animate-pulse mb-4">
                <Clock className="mx-auto text-yellow-500" size={64} />
              </div>
              <h2 className="font-bold text-xl mb-2">Aguardando Resposta do Motorista</h2>
              <p className="text-gray-600 mb-4">
                {passengerQuery.from} → {passengerQuery.to}
              </p>
              <button
                onClick={() => setPassengerQuery({ ...passengerQuery, step: 1 })}
                className="text-red-500 hover:text-red-600"
              >
                Cancelar consulta
              </button>
            </div>
          )}

          {/* Preço Respondido */}
          {passengerQuery.step === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-4 text-center">
                <h2 className="font-bold text-xl mb-2">Preço Calculado</h2>
                <p className="text-gray-600 mb-4">
                  {passengerQuery.from} → {passengerQuery.to}
                </p>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  R$ {passengerQuery.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {settings.autoRespondPrice ? '(Calculado automaticamente)' : '(Respondido pelo motorista)'}
                </p>
              </div>

              <button
                onClick={() => {
                  const message = `Olá! Gostaria de confirmar a corrida:

📍 De: ${passengerQuery.from}
📍 Para: ${passengerQuery.to}
💰 Valor: R$ ${passengerQuery.price.toFixed(2)}

Podemos combinar os detalhes?`;
                  openWhatsApp('41995077146', message);
                }}
                className="w-full bg-green-500 text-white py-4 rounded-lg font-bold hover:bg-green-600 mb-3 flex items-center justify-center gap-2"
              >
                <MessageSquare size={20} />
                Confirmar e Conversar no WhatsApp
              </button>

              <button
                onClick={() => setPassengerQuery({
                  step: 1,
                  name: passengerQuery.name,
                  from: '',
                  to: '',
                  estimatedDistance: 0,
                  price: null,
                  queryId: null
                })}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Fazer Nova Consulta
              </button>
            </div>
          )}

          {/* Localização do Motorista */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-bold text-lg mb-4">Localização do Motorista</h2>
            
            {!isTrackingLocation ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="animate-pulse mb-4">
                  <MapPin className="mx-auto text-yellow-500" size={48} />
                </div>
                <p className="text-yellow-800 font-semibold mb-2">Obtendo localização...</p>
                <p className="text-sm text-yellow-700">Aguarde enquanto localizamos o motorista</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="text-blue-600" size={20} />
                    <span className="font-semibold text-blue-800">Motorista Localizado</span>
                  </div>
                  <div className="text-sm space-y-1 text-blue-700">
                    <p>📍 Lat: {driverLocation?.lat.toFixed(6)}</p>
                    <p>📍 Lng: {driverLocation?.lng.toFixed(6)}</p>
                    <p>🕐 Última atualização: {driverLocation?.timestamp}</p>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-600">
                  🗺️ Mapa em tempo real seria exibido aqui<br />
                  <span className="text-sm">(Google Maps API necessária)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // RENDER: Calculadora
  const renderCalculator = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Calculadora de Preço</h2>
      
      <div className="bg-gray-50 rounded p-4 mb-4 text-sm space-y-1">
        <p><strong>Suas Configurações:</strong></p>
        <p>• Preço por km: R$ {settings.pricePerKm.toFixed(2)}</p>
        <p>• Preço mínimo: R$ {settings.minimumPrice.toFixed(2)}</p>
        <p>• Custo combustível/km: R$ {settings.fuelCostPerKm.toFixed(2)}</p>
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Distância (km)</label>
        <input
          type="number"
          step="0.1"
          placeholder="Ex: 5.5"
          value={calculator.distance}
          onChange={(e) => setCalculator({ ...calculator, distance: e.target.value })}
          className="w-full px-4 py-3 border rounded-lg text-lg"
        />
      </div>

      <button
        onClick={() => {
          if (calculator.distance) {
            const result = calculatePrice(parseFloat(calculator.distance));
            setCalculator({ ...calculator, result });
          }
        }}
        disabled={!calculator.distance}
        className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-300 mb-6"
      >
        Calcular
      </button>

      {calculator.result && (
        <div className="space-y-3">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Preço Sugerido</p>
            <p className="text-4xl font-bold text-green-600">R$ {calculator.result.price}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Custo Combustível</p>
              <p className="text-xl font-bold text-red-600">R$ {calculator.result.fuelCost}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Lucro Líquido</p>
              <p className="text-xl font-bold text-green-600">R$ {calculator.result.profit}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // RENDER: Relatórios
  const renderReports = () => {
    const monthlyRides = rides.length;
    const monthlyRevenue = rides.reduce((sum, ride) => sum + ride.actualPrice, 0);
    const avgPerRide = monthlyRides > 0 ? monthlyRevenue / monthlyRides : 0;
    const totalDistance = rides.reduce((sum, ride) => sum + parseFloat(ride.distance), 0);
    const fuelCost = totalDistance * settings.fuelCostPerKm;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Resumo do Mês</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm text-gray-600 mb-1">Total de Corridas</p>
              <p className="text-3xl font-bold text-blue-600">{monthlyRides}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-sm text-gray-600 mb-1">Receita Total</p>
              <p className="text-3xl font-bold text-green-600">R$ {monthlyRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded p-4">
              <p className="text-sm text-gray-600 mb-1">Média por Corrida</p>
              <p className="text-3xl font-bold text-purple-600">R$ {avgPerRide.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-sm text-gray-600 mb-1">Custo Combustível</p>
              <p className="text-3xl font-bold text-red-600">R$ {fuelCost.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {rides.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Histórico Detalhado</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Data/Hora</th>
                    <th className="px-4 py-2 text-left">Passageiro</th>
                    <th className="px-4 py-2 text-left">Trajeto</th>
                    <th className="px-4 py-2 text-left">Distância</th>
                    <th className="px-4 py-2 text-left">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((ride, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{ride.dateTime}</td>
                      <td className="px-4 py-2">{ride.passenger}</td>
                      <td className="px-4 py-2 text-xs">{ride.from} → {ride.to}</td>
                      <td className="px-4 py-2">{ride.distance}</td>
                      <td className="px-4 py-2 font-semibold text-green-600">R$ {ride.actualPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            const report = `RELATÓRIO MENSAL - ELOMOB
=====================================
Período: ${new Date().toLocaleDateString('pt-BR')}
Veículo: ${settings.vehicleModel}
Placa: ${settings.licensePlate}

RESUMO FINANCEIRO
-----------------
Total de Corridas: ${monthlyRides}
Receita Total: R$ ${monthlyRevenue.toFixed(2)}
Média por Corrida: R$ ${avgPerRide.toFixed(2)}
Custo Combustível Estimado: R$ ${fuelCost.toFixed(2)}
Lucro Líquido Estimado: R$ ${(monthlyRevenue - fuelCost).toFixed(2)}

DETALHAMENTO
------------
${rides.map(r => `${r.dateTime} | ${r.passenger} | ${r.from} → ${r.to} | ${r.distance} | R$ ${r.actualPrice.toFixed(2)}`).join('\n')}

Relatório gerado em: ${new Date().toLocaleString('pt-BR')}
`;
            const blob = new Blob([report], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `elomob-relatorio-${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
          }}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 flex items-center justify-center gap-2"
        >
          <FileText size={20} />
          Baixar Relatório Completo (.txt)
        </button>
      </div>
    );
  };

  // RENDER: Configurações
  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Informações do Veículo</h2>
        <div className="space-y-3">
          <div>
            <label className="block mb-1 font-semibold text-sm">Modelo do Veículo</label>
            <input
              type="text"
              value={settings.vehicleModel}
              onChange={(e) => setSettings({ ...settings, vehicleModel: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-sm">Placa</label>
            <input
              type="text"
              value={settings.licensePlate}
              onChange={(e) => setSettings({ ...settings, licensePlate: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Precificação</h2>
        <div className="space-y-3">
          <div>
            <label className="block mb-1 font-semibold text-sm">Preço por Quilômetro (R$)</label>
            <input
              type="number"
              step="0.10"
              value={settings.pricePerKm}
              onChange={(e) => setSettings({ ...settings, pricePerKm: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-sm">Preço Mínimo da Corrida (R$)</label>
            <input
              type="number"
              step="0.50"
              value={settings.minimumPrice}
              onChange={(e) => setSettings({ ...settings, minimumPrice: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-sm">Custo de Combustível por Km (R$)</label>
            <input
              type="number"
              step="0.10"
              value={settings.fuelCostPerKm}
              onChange={(e) => setSettings({ ...settings, fuelCostPerKm: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border rounded"
            />
            <p className="text-xs text-gray-500 mt-1">Para calcular lucro líquido</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Área de Atendimento</h2>
        <div>
          <label className="block mb-1 font-semibold text-sm">Raio Máximo de Atendimento (km)</label>
          <input
            type="number"
            value={settings.maxRadius}
            onChange={(e) => setSettings({ ...settings, maxRadius: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border rounded"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Consultas de Preço</h2>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold">Responder Automaticamente</p>
            <p className="text-sm text-gray-600">Sistema calcula e responde na hora</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, autoRespondPrice: !settings.autoRespondPrice })}
            className={`w-14 h-8 rounded-full transition ${
              settings.autoRespondPrice ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-6 h-6 bg-white rounded-full transition transform ${
              settings.autoRespondPrice ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
          {settings.autoRespondPrice
            ? '✓ Consultas são respondidas automaticamente com base nas suas configurações (preço/km × distância)'
            : 'ℹ️ Você receberá cada consulta e poderá definir o preço manualmente'
          }
        </div>
      </div>
    </div>
  );

  // ============= TELA DE LOGIN =============
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <Car className="mx-auto text-blue-600 mb-4" size={64} />
            <h1 className="text-3xl font-bold text-gray-800">EloMob</h1>
            <p className="text-gray-600 mt-2">Sistema para Motoristas</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usuário
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="motorista1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">⚠️ {loginError}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Entrar
            </button>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
              <p className="text-xs text-gray-600 font-semibold mb-2">
                📝 Usuários de Teste:
              </p>
              <p className="text-xs text-gray-600">
                motorista1 até motorista10<br/>
                Senha: senha123 (todos)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alternador de Modo (apenas para demonstração) */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">EloMob</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">👋 {currentUser.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 px-3 py-2 rounded hover:bg-red-600 transition text-sm"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {viewMode === 'passenger' ? (
        renderPassengerView()
      ) : (
        <div className="max-w-6xl mx-auto p-4">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-4 p-2 flex gap-2 overflow-x-auto">
            {[
              { id: 'dashboard', icon: Car, label: 'Dashboard' },
              { id: 'calculator', icon: Calculator, label: 'Calculadora' },
              { id: 'reports', icon: FileText, label: 'Relatórios' },
              { id: 'settings', icon: Settings, label: 'Configurações' }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conteúdo das Tabs */}
          {activeTab === 'dashboard' && renderDriverDashboard()}
          {activeTab === 'calculator' && renderCalculator()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      )}
    </div>
  );
};

export default EloMob;