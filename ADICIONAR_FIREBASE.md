# 🔥 COMO ADICIONAR FIREBASE AO ELOMOB.JSX

## Instruções para transformar o elomob.jsx em versão com Firebase

Siga estes passos para adicionar Firebase ao código original:

---

## PASSO 1: Adicionar Imports no Topo do Arquivo

Logo no início do arquivo `elomob.jsx`, **ANTES** da linha `const EloMob = () => {`, adicione:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';
```

---

## PASSO 2: Adicionar Configuração do Firebase

Logo **DEPOIS** dos imports e **ANTES** da constante `DRIVERS`, adicione:

```javascript
// ============= CONFIGURAÇÃO FIREBASE =============
// SUBSTITUA COM SUAS CREDENCIAIS!
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
  databaseURL: "https://SEU_PROJECT_ID-default-rtdb.firebaseio.com"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);
```

---

## PASSO 3: Adicionar Estado de Loading

Dentro do component `EloMob`, logo após o estado `loginError`, adicione:

```javascript
const [isLoading, setIsLoading] = useState(false);
```

---

## PASSO 4: Adicionar Funções do Firebase

Logo **DEPOIS** da constante `messageTemplates` e **ANTES** das funções originais, adicione estas funções:

```javascript
// ============= FIREBASE FUNCTIONS =============

const loadDriverData = async (driverId) => {
  setIsLoading(true);
  try {
    const driverRef = doc(db, 'drivers', driverId);
    const driverSnap = await getDoc(driverRef);
    
    if (driverSnap.exists()) {
      const data = driverSnap.data();
      setSettings(data.settings || settings);
      setServiceType(data.serviceType || 'car-passenger');
      setRouteConfig(data.routeConfig || routeConfig);
      setRides(data.rides || []);
      setEarnings(data.earnings || { today: 0, week: 0, month: 0 });
      setIsAvailable(data.isAvailable || false);
      setSessionId(data.sessionId || '');
    } else {
      // Primeira vez - criar documento
      await setDoc(driverRef, {
        id: driverId,
        settings,
        serviceType,
        routeConfig,
        rides: [],
        earnings: { today: 0, week: 0, month: 0 },
        isAvailable: false,
        sessionId: '',
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    alert('Erro ao conectar com Firebase. Verifique as configurações.');
  }
  setIsLoading(false);
};

const saveDriverData = async () => {
  if (!currentUser) return;
  
  try {
    const driverRef = doc(db, 'drivers', currentUser.id);
    await updateDoc(driverRef, {
      settings,
      serviceType,
      routeConfig,
      rides,
      earnings,
      isAvailable,
      sessionId,
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
};

const updateDriverLocation = async (location) => {
  if (!currentUser || !location) return;
  
  try {
    const locationRef = ref(rtdb, `drivers/${currentUser.id}/location`);
    await set(locationRef, {
      lat: location.lat,
      lng: location.lng,
      accuracy: location.accuracy,
      timestamp: location.timestamp,
      simulated: location.simulated || false,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Erro ao atualizar localização:', error);
  }
};

const listenToPriceQueries = () => {
  if (!currentUser) return;

  const q = query(
    collection(db, 'priceQueries'),
    where('driverId', '==', currentUser.id)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const queries = [];
    snapshot.forEach((doc) => {
      queries.push({ id: doc.id, ...doc.data() });
    });
    setPriceQueries(queries);
  });

  return unsubscribe;
};
```

---

## PASSO 5: Adicionar useEffects para Firebase

Logo **DEPOIS** das funções do Firebase, adicione:

```javascript
// ============= EFFECTS PARA FIREBASE =============

useEffect(() => {
  if (currentUser) {
    loadDriverData(currentUser.id);
    const unsubscribe = listenToPriceQueries();
    return () => unsubscribe && unsubscribe();
  }
}, [currentUser]);

useEffect(() => {
  if (currentUser && (settings || serviceType || routeConfig || rides || earnings || isAvailable)) {
    const timer = setTimeout(() => {
      saveDriverData();
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [settings, serviceType, routeConfig, rides, earnings, isAvailable]);

useEffect(() => {
  if (currentUser && driverLocation) {
    updateDriverLocation(driverLocation);
  }
}, [driverLocation]);
```

---

## PASSO 6: Adicionar Indicador de Loading

Na função de render, **DEPOIS** da verificação `if (!currentUser)` e **ANTES** do return principal, adicione:

```javascript
if (isLoading) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando dados do Firebase...</p>
      </div>
    </div>
  );
}
```

---

## PASSO 7: Adicionar Indicador Visual no Dashboard

Dentro do render do dashboard, logo no **INÍCIO** (primeira coisa após `<div className="space-y-4">`), adicione:

```javascript
{/* Indicador Firebase Conectado */}
<div className="bg-green-50 border border-green-200 rounded-lg p-4">
  <p className="text-sm text-green-800 flex items-center gap-2">
    <Check size={16} />
    <strong>Firebase Conectado!</strong> Seus dados estão sendo salvos automaticamente na nuvem.
  </p>
</div>
```

---

## PASSO 8: Modificar handleLogout

Encontre a função `handleLogout` e modifique para:

```javascript
const handleLogout = () => {
  saveDriverData(); // Salva antes de sair
  setCurrentUser(null);
  setLoginForm({ username: '', password: '' });
  setIsAvailable(false);
  setSessionId('');
  stopLocationTracking();
};
```

---

## PASSO 9: Modificar submitPriceQuery para Salvar no Firebase

Encontre a função `submitPriceQuery` e **SUBSTITUA** por:

```javascript
const submitPriceQuery = async () => {
  const distance = Math.random() * 10 + 2;
  const calculated = calculatePrice(distance);
  
  try {
    const queryRef = doc(collection(db, 'priceQueries'));
    const newQuery = {
      passenger: passengerQuery.name,
      from: passengerQuery.from,
      to: passengerQuery.to,
      estimatedDistance: distance.toFixed(1),
      driverId: currentUser?.id || 'guest',
      status: settings.autoRespondPrice ? 'answered' : 'pending',
      driverResponse: settings.autoRespondPrice ? parseFloat(calculated.price) : null,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      createdAt: new Date().toISOString()
    };
    
    await setDoc(queryRef, newQuery);
    
    if (settings.autoRespondPrice) {
      setPassengerQuery({
        ...passengerQuery,
        step: 3,
        estimatedDistance: distance,
        price: parseFloat(calculated.price),
        queryId: queryRef.id
      });
    } else {
      setPassengerQuery({
        ...passengerQuery,
        step: 2,
        estimatedDistance: distance,
        queryId: queryRef.id
      });
    }
  } catch (error) {
    console.error('Erro ao enviar consulta:', error);
    alert('Erro ao enviar consulta. Tente novamente.');
  }
};
```

---

## PASSO 10: Modificar respondPriceQuery

Encontre a função `respondPriceQuery` e **SUBSTITUA** por:

```javascript
const respondPriceQuery = async (id, price) => {
  try {
    const queryRef = doc(db, 'priceQueries', id);
    await updateDoc(queryRef, {
      status: 'answered',
      driverResponse: price
    });

    if (passengerQuery.queryId === id) {
      setPassengerQuery({ ...passengerQuery, step: 3, price });
    }
  } catch (error) {
    console.error('Erro ao responder consulta:', error);
    alert('Erro ao responder. Tente novamente.');
  }
};
```

---

## ✅ CHECKLIST FINAL

Antes de testar, verifique se:

- [ ] Adicionou todos os imports do Firebase
- [ ] Colou suas credenciais do Firebase (firebaseConfig)
- [ ] Adicionou estado `isLoading`
- [ ] Adicionou todas as funções Firebase
- [ ] Adicionou os 3 useEffects
- [ ] Adicionou tela de loading
- [ ] Adicionou indicador verde no dashboard
- [ ] Modificou handleLogout
- [ ] Modificou submitPriceQuery
- [ ] Modificou respondPriceQuery

---

## 🧪 TESTAR

1. Salve o arquivo
2. Rode: `npm install` (instala Firebase)
3. Rode: `npm run dev`
4. Acesse: http://localhost:5173
5. Faça login com motorista1 / senha123
6. Configure algo e veja se salva
7. Recarregue a página - dados devem voltar!

---

## 🆘 PROBLEMAS COMUNS

### "Firebase not found"
→ Rode `npm install firebase`

### "Permission denied"
→ Verifique as regras de segurança do Firebase

### "Invalid credentials"
→ Confira se copiou corretamente o firebaseConfig

### Dados não salvam
→ Abra o Console do navegador (F12) e veja os erros

---

**Feito! Agora você tem EloMob com Firebase funcionando! 🎉**
