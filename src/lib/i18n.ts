export const languages = [
  { code: "en", label: "English" },
  { code: "zh", label: "简体中文" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

const en = {
  home: "Home", markets: "Markets", products: "Products", security: "Security", login: "Login", register: "Register", logout: "Logout", account: "Account", assets: "Assets", admin: "Admin", mobileDemo: "Mobile", platformMode: "Platform Mode", noRealFunds: "", demoOnly: "", simulatedAssets: "Assets",
  email: "Email", password: "Password", confirmPassword: "Confirm Password", countryRegion: "Country / Region", preferredLanguage: "Preferred Language", accessCode: "Access Code", submit: "Submit", invalidCode: "Invalid code", enterDemo: "Enter", backHome: "Back to Home",
  assetCenter: "Asset Center", totalAssets: "Total Asset Valuation", deposit: "Deposit", withdraw: "Withdraw", fundLedger: "Fund Ledger", depositAddress: "Deposit Address", withdrawalAddress: "Withdrawal Address", generateAddress: "Generate Address", copyAddress: "Copy Address", addressBook: "Address Book", addAddress: "Add Address", deleteAddress: "Delete Address", network: "Network", asset: "Asset", address: "Address", memo: "Memo", tag: "Tag", label: "Label", fee: "Fee", submitWithdrawal: "Submit Withdrawal", depositHistory: "Deposit History", withdrawalHistory: "Withdrawal History", addressManagement: "Address Management", sendDepositAddress: "Send Deposit Address", selectUser: "Select User", searchUser: "Search User", assignAddress: "Assign Address", saveAddress: "Save Address", disableAddress: "Disable Address", addressNotAssignedYet: "Address not assigned yet", contactSupport: "Contact support", invalidAddressFormat: "Invalid address format", assignedAt: "Assigned At", assignedBy: "Assigned By", loginRequired: "Authentication required", loginToContinue: "Please log in to continue.",
  accountCenter: "Account", uid: "UID", kycStatus: "KYC Status", accountStatus: "Account Status", role: "Role", createdAt: "Created At",
  accessGateway: "Secure Gateway", mobileTitle: "Market Daily", latestUpdates: "Latest Updates", searchPlaceholder: "Search news, coins, market insights", accessDemo: "Access",
  exchangeDemo: "Exchange", language: "Language", personalCenter: "Personal Center", safeTransparent: "Safe and Transparent", verify: "Verify", smartContracts: "Smart Contracts", service: "Service", demoTopUp: "Top-up", usdtMarket: "USDT Market", name: "Name", latestPrice: "Latest Price", riseFall: "Rise and Fall", quotes: "Quotes", coins: "Coins", trading: "Trading", derivatives: "Derivatives", mine: "Mine",
  searchCoin: "Search coin", hot: "Hot", meme: "Meme", layer1: "Layer1", ai: "AI", defi: "DeFi", volume: "Volume", demoBalance: "Balance", estimatedValue: "Estimated Value",
  demoTrading: "Trading", tradingPair: "Trading Pair", buy: "Buy", sell: "Sell", amount: "Amount", placeDemoOrder: "Place Order", orderRecords: "Order Records", noDemoOrders: "No orders yet.",
  derivativesDemo: "Derivatives", long: "Long", short: "Short", leverage: "Leverage", margin: "Margin", demoPositions: "Positions", simulationOnly: "",
  demoAssets: "Assets", totalEstimatedValue: "Total Estimated Value", available: "Available", frozen: "Frozen", demoWithdraw: "Withdraw",
  demoUser: "User", securityCenter: "Security Center", verification: "Verification", helpCenter: "Help Center",
  adminDashboard: "Admin Dashboard", platformAdminConsole: "Admin Console", adminAccessRequired: "Admin access required", userCount: "Users", todayDeposit: "Today Deposit", todayWithdraw: "Today Withdrawal", pendingKyc: "Pending KYC", pendingWithdrawals: "Pending Withdrawals", managementEntries: "Management Entries", reviewQueue: "Review Queue",
};

export type TranslationKey = keyof typeof en;

type TranslationMap = Partial<Record<TranslationKey, string>>;

export const translations: Record<LanguageCode, TranslationMap> = {
  en,
  zh: {
    home: "首页", markets: "行情", products: "产品", security: "安全", login: "登录", register: "注册", logout: "退出登录", account: "账户", assets: "资产", admin: "后台", mobileDemo: "移动", platformMode: "平台模式", noRealFunds: "", demoOnly: "", simulatedAssets: "资产",
    email: "邮箱", password: "密码", confirmPassword: "确认密码", countryRegion: "国家 / 地区", preferredLanguage: "偏好语言", accessCode: "访问码", submit: "提交", invalidCode: "访问码无效", enterDemo: "进入", backHome: "返回首页",
    assetCenter: "资产中心", totalAssets: "总资产估值", deposit: "充值", withdraw: "提现", fundLedger: "资金流水", depositAddress: "充币地址", withdrawalAddress: "提币地址", generateAddress: "生成地址", copyAddress: "复制地址", addressBook: "地址簿", addAddress: "添加地址", deleteAddress: "删除地址", network: "网络", asset: "资产", address: "地址", memo: "备注", tag: "标签", label: "标签", fee: "手续费", submitWithdrawal: "提交提现", depositHistory: "充值记录", withdrawalHistory: "提现记录", addressManagement: "地址管理", sendDepositAddress: "发送充值地址", selectUser: "选择用户", searchUser: "搜索用户", assignAddress: "分配地址", saveAddress: "保存地址", disableAddress: "禁用地址", addressNotAssignedYet: "地址尚未分配", contactSupport: "联系客服", invalidAddressFormat: "地址格式无效", assignedAt: "分配时间", assignedBy: "分配管理员", loginRequired: "需要登录", loginToContinue: "请先登录后继续。",
    accountCenter: "用户中心", uid: "UID", kycStatus: "KYC 状态", accountStatus: "账户状态", role: "角色", createdAt: "创建时间",
    accessGateway: "安全入口", mobileTitle: "市场资讯", latestUpdates: "最新资讯", searchPlaceholder: "搜索资讯、币种、市场观点", accessDemo: "进入",
    exchangeDemo: "交易所", language: "语言", personalCenter: "个人中心", safeTransparent: "安全透明", verify: "认证", smartContracts: "智能合约", service: "服务", demoTopUp: "充值", usdtMarket: "USDT 行情", name: "名称", latestPrice: "最新价格", riseFall: "涨跌幅", quotes: "行情", coins: "币种", trading: "交易", derivatives: "合约", mine: "我的",
    searchCoin: "搜索币种", hot: "热门", meme: "Meme", layer1: "Layer1", ai: "AI", defi: "DeFi", volume: "成交量", demoBalance: "余额", estimatedValue: "估值",
    demoTrading: "交易", tradingPair: "交易对", buy: "买入", sell: "卖出", amount: "数量", placeDemoOrder: "提交订单", orderRecords: "订单记录", noDemoOrders: "暂无订单。",
    derivativesDemo: "合约", long: "做多", short: "做空", leverage: "杠杆", margin: "保证金", demoPositions: "仓位", simulationOnly: "",
    demoAssets: "资产", totalEstimatedValue: "总估值", available: "可用", frozen: "冻结", demoWithdraw: "提现",
    demoUser: "用户", securityCenter: "安全中心", verification: "身份认证", helpCenter: "帮助中心",
    adminDashboard: "后台首页", platformAdminConsole: "后台控制台", adminAccessRequired: "需要管理员权限", userCount: "用户数量", todayDeposit: "今日充值", todayWithdraw: "今日提现", pendingKyc: "待审核 KYC", pendingWithdrawals: "待审核提现", managementEntries: "管理入口", reviewQueue: "待处理队列",
  },
  "zh-TW": {},
  ja: {
    home: "ホーム", markets: "マーケット", products: "製品", security: "セキュリティ", login: "ログイン", register: "登録", logout: "ログアウト", account: "アカウント", assets: "資産", admin: "管理", mobileDemo: "モバイル", platformMode: "プラットフォーム", noRealFunds: "", demoOnly: "", simulatedAssets: "資産",
    email: "メール", password: "パスワード", confirmPassword: "確認パスワード", countryRegion: "国 / 地域", preferredLanguage: "優先言語", accessCode: "アクセスコード", submit: "送信", invalidCode: "無効なコード", enterDemo: "入る", backHome: "ホームへ戻る",
    assetCenter: "資産センター", totalAssets: "総資産評価", deposit: "入金", withdraw: "出金", fundLedger: "資金履歴", depositAddress: "入金アドレス", withdrawalAddress: "出金アドレス", generateAddress: "アドレス生成", copyAddress: "アドレスをコピー", addressBook: "アドレス帳", addAddress: "アドレス追加", deleteAddress: "アドレス削除", network: "ネットワーク", asset: "資産", memo: "メモ", tag: "タグ", fee: "手数料", submitWithdrawal: "出金申請", depositHistory: "入金履歴", withdrawalHistory: "出金履歴", addressManagement: "アドレス管理", loginRequired: "ログインが必要", loginToContinue: "続行するにはログインしてください。",
    accountCenter: "アカウント", uid: "UID", kycStatus: "KYC 状態", accountStatus: "口座状態", role: "権限", createdAt: "作成日時",
    accessGateway: "安全ゲート", mobileTitle: "マーケットニュース", latestUpdates: "最新情報", searchPlaceholder: "ニュース、銘柄、市場情報を検索", accessDemo: "アクセス", exchangeDemo: "取引所", language: "言語", personalCenter: "個人センター", safeTransparent: "安全で透明", verify: "認証", smartContracts: "スマート契約", service: "サービス", demoTopUp: "入金", usdtMarket: "USDT 市場", name: "名称", latestPrice: "最新価格", riseFall: "騰落", quotes: "相場", coins: "コイン", trading: "取引", derivatives: "デリバティブ", mine: "マイページ",
    searchCoin: "コイン検索", hot: "人気", volume: "出来高", demoBalance: "残高", estimatedValue: "評価額", demoTrading: "取引", tradingPair: "取引ペア", buy: "買い", sell: "売り", amount: "数量", placeDemoOrder: "注文", orderRecords: "注文履歴", noDemoOrders: "注文はありません。", derivativesDemo: "デリバティブ", long: "ロング", short: "ショート", leverage: "レバレッジ", margin: "証拠金", demoPositions: "ポジション", simulationOnly: "", demoAssets: "資産", totalEstimatedValue: "総評価額", available: "利用可能", frozen: "凍結", demoWithdraw: "出金", demoUser: "ユーザー", securityCenter: "セキュリティセンター", verification: "認証", helpCenter: "ヘルプ", adminDashboard: "管理ダッシュボード", platformAdminConsole: "プラットフォーム管理", adminAccessRequired: "管理者権限が必要",
  },
  ko: {
    home: "홈", markets: "마켓", products: "상품", security: "보안", login: "로그인", register: "가입", logout: "로그아웃", account: "계정", assets: "자산", admin: "관리자", mobileDemo: "모바일", platformMode: "플랫폼 모드", noRealFunds: "", demoOnly: "", simulatedAssets: "자산",
    email: "이메일", password: "비밀번호", confirmPassword: "비밀번호 확인", countryRegion: "국가 / 지역", preferredLanguage: "선호 언어", accessCode: "접속 코드", submit: "제출", invalidCode: "잘못된 코드", enterDemo: "입장", backHome: "홈으로", assetCenter: "자산 센터", totalAssets: "총 자산 평가", deposit: "입금", withdraw: "출금", fundLedger: "자금 내역", depositAddress: "입금 주소", withdrawalAddress: "출금 주소", generateAddress: "주소 생성", copyAddress: "주소 복사", addressBook: "주소록", addAddress: "주소 추가", deleteAddress: "주소 삭제", network: "네트워크", asset: "자산", memo: "메모", tag: "태그", fee: "수수료", submitWithdrawal: "출금 제출", depositHistory: "입금 기록", withdrawalHistory: "출금 기록", addressManagement: "주소 관리", loginRequired: "로그인 필요", loginToContinue: "계속하려면 로그인하세요.", accountCenter: "계정", uid: "UID", kycStatus: "KYC 상태", accountStatus: "계정 상태", role: "역할", createdAt: "생성일", mobileTitle: "마켓 데일리", latestUpdates: "최신 소식", searchPlaceholder: "뉴스, 코인, 시장 검색", accessDemo: "접속", exchangeDemo: "거래소", language: "언어", personalCenter: "개인 센터", safeTransparent: "안전하고 투명", verify: "인증", smartContracts: "스마트 계약", service: "서비스", demoTopUp: "충전", usdtMarket: "USDT 마켓", name: "이름", latestPrice: "최신가", riseFall: "등락", quotes: "시세", coins: "코인", trading: "거래", derivatives: "파생상품", mine: "내 정보", searchCoin: "코인 검색", volume: "거래량", demoBalance: "잔액", estimatedValue: "평가액", demoTrading: "거래", tradingPair: "거래쌍", buy: "매수", sell: "매도", amount: "수량", placeDemoOrder: "주문", orderRecords: "주문 기록", noDemoOrders: "주문 없음.", derivativesDemo: "파생상품", long: "롱", short: "숏", leverage: "레버리지", margin: "마진", demoPositions: "포지션", simulationOnly: "", demoAssets: "자산", totalEstimatedValue: "총 평가액", available: "사용 가능", frozen: "동결", demoWithdraw: "출금", demoUser: "사용자", securityCenter: "보안 센터", verification: "인증", helpCenter: "고객센터", adminDashboard: "관리자 대시보드", platformAdminConsole: "관리자 콘솔", adminAccessRequired: "관리자 권한 필요",
  },
  es: {
    home: "Inicio", markets: "Mercados", products: "Productos", security: "Seguridad", login: "Iniciar sesión", register: "Registrarse", logout: "Cerrar sesión", account: "Cuenta", assets: "Activos", admin: "Admin", mobileDemo: "Móvil", platformMode: "Modo plataforma", noRealFunds: "", demoOnly: "", simulatedAssets: "Activos", email: "Email", password: "Contraseña", confirmPassword: "Confirmar contraseña", countryRegion: "País / Región", preferredLanguage: "Idioma preferido", accessCode: "Código de acceso", submit: "Enviar", invalidCode: "Código inválido", enterDemo: "Entrar", backHome: "Volver", assetCenter: "Centro de activos", totalAssets: "Valor total", deposit: "Depositar", withdraw: "Retirar", fundLedger: "Movimientos", depositAddress: "Dirección de depósito", withdrawalAddress: "Dirección de retiro", generateAddress: "Generar dirección", copyAddress: "Copiar dirección", addressBook: "Libreta de direcciones", addAddress: "Agregar dirección", deleteAddress: "Eliminar dirección", network: "Red", asset: "Activo", memo: "Memo", tag: "Etiqueta", fee: "Comisión", submitWithdrawal: "Enviar retiro", depositHistory: "Historial de depósitos", withdrawalHistory: "Historial de retiros", addressManagement: "Gestión de direcciones", loginRequired: "Inicio requerido", loginToContinue: "Inicia sesión para continuar.", accountCenter: "Cuenta", uid: "UID", kycStatus: "Estado KYC", accountStatus: "Estado de cuenta", role: "Rol", createdAt: "Creado", mobileTitle: "Mercado diario", latestUpdates: "Últimas noticias", searchPlaceholder: "Buscar noticias, monedas, mercados", accessDemo: "Acceder", exchangeDemo: "Exchange", language: "Idioma", personalCenter: "Centro personal", safeTransparent: "Seguro y transparente", verify: "Verificar", smartContracts: "Contratos inteligentes", service: "Servicio", demoTopUp: "Recarga", usdtMarket: "Mercado USDT", name: "Nombre", latestPrice: "Último precio", riseFall: "Cambio", quotes: "Cotizaciones", coins: "Monedas", trading: "Trading", derivatives: "Derivados", mine: "Mi cuenta", searchCoin: "Buscar moneda", volume: "Volumen", demoBalance: "Saldo", estimatedValue: "Valor estimado", demoTrading: "Trading", tradingPair: "Par", buy: "Comprar", sell: "Vender", amount: "Cantidad", placeDemoOrder: "Orden", orderRecords: "Órdenes", noDemoOrders: "Sin órdenes.", derivativesDemo: "Derivados", long: "Long", short: "Short", leverage: "Apalancamiento", margin: "Margen", demoPositions: "Posiciones", simulationOnly: "", demoAssets: "Activos", totalEstimatedValue: "Valor total", available: "Disponible", frozen: "Congelado", demoWithdraw: "Retiro", demoUser: "Usuario", securityCenter: "Centro de seguridad", verification: "Verificación", helpCenter: "Ayuda", adminDashboard: "Panel admin", platformAdminConsole: "Consola admin platform", adminAccessRequired: "Se requiere acceso admin",
  },
  fr: {}, de: {}, pt: {}, ar: {},
};

export function isLanguageCode(value: string): value is LanguageCode {
  return languages.some((language) => language.code === value);
}

export function translate(language: LanguageCode, key: TranslationKey) {
  return translations[language][key] ?? translations.en[key] ?? key;
}

