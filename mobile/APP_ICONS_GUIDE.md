# Guia de Criação de Ícones e Splash Screen - App Elosaúde

## Status: 📋 Especificações Prontas (Assets precisam ser criados)

## Ícone do App (App Icon)

### Design Recomendado:
- **Conceito**: Cruz médica ou símbolo de saúde + verde da marca (#20a490)
- **Estilo**: Moderno, minimalista, reconhecível em tamanhos pequenos
- **Cores**: Verde primário (#20a490), branco, gradiente sutil
- **Evitar**: Texto pequeno, detalhes finos que não aparecem em ícones pequenos

### Arquivo Master:
- **Tamanho**: 1024x1024px (PNG, sem transparência)
- **Nome**: `icon-1024.png`
- **Local**: `/mobile/assets/images/`

## Tamanhos Necessários:

### iOS (App Store + Devices):

#### App Store:
- 1024x1024 (App Store

)

#### iPhone:
- 180x180 (iPhone Pro Max @3x)
- 120x120 (iPhone @2x)
- 87x87 (iPhone Notification @3x)
- 80x80 (iPhone Spotlight @2x)
- 60x60 (iPhone Notification @2x)
- 58x58 (iPhone Settings @2x)
- 40x40 (iPhone Spotlight @2x)
- 29x29 (iPhone Settings @1x)

#### iPad:
- 167x167 (iPad Pro @2x)
- 152x152 (iPad @2x)
- 76x76 (iPad @1x)
- 40x40 (iPad Spotlight @1x)
- 29x29 (iPad Settings @1x)

### Android (Play Store + Devices):

#### Play Store:
- 512x512 (Play Store Icon)

#### Densidades:
- mdpi: 48x48
- hdpi: 72x72
- xhdpi: 96x96
- xxhdpi: 144x144
- xxxhdpi: 192x192

## Splash Screen

### Design Recomendado:
- **Background**: Branco ou verde suave
- **Logo**: Centralizado, versão horizontal ou símbolo
- **Tamanho do logo**: ~40% da largura da tela
- **Slogan**: Opcional, abaixo do logo
- **Loading indicator**: ActivityIndicator nativo

### Especificações:

#### Imagem Principal:
- **Tamanho**: 1242x2688px (iPhone Pro Max)
- **Nome**: `splash.png`
- **Local**: `/mobile/assets/images/`

#### Background Color:
- **Cor**: #FFFFFF ou #F5F9F8 (verde muito claro)

## Ferramentas para Gerar Assets:

### Opção 1: Serviço Online (Recomendado)
**MakeAppIcon** - https://makeappicon.com/
1. Upload do ícone 1024x1024
2. Gera todos os tamanhos automaticamente
3. Download ZIP com estrutura correta

**AppIcon.co** - https://appicon.co/
1. Upload do ícone
2. Seleciona iOS + Android
3. Download de todos os assets

### Opção 2: Script Automatizado
Usando ImageMagick:

```bash
# Instalar ImageMagick
brew install imagemagick  # macOS
apt-get install imagemagick  # Linux

# Gerar ícones iOS
convert icon-1024.png -resize 180x180 ios/icon-180.png
convert icon-1024.png -resize 120x120 ios/icon-120.png
# ... (repetir para todos os tamanhos)

# Gerar ícones Android
convert icon-1024.png -resize 48x48 android/mipmap-mdpi/ic_launcher.png
convert icon-1024.png -resize 72x72 android/mipmap-hdpi/ic_launcher.png
# ... (repetir para todos os tamanhos)
```

### Opção 3: Expo Assets CLI (Se usando Expo Managed)
```bash
expo optimize
```

## Estrutura de Arquivos:

### iOS:
```
mobile/ios/elosaude/Images.xcassets/AppIcon.appiconset/
├── Contents.json
├── icon-1024.png
├── icon-180.png
├── icon-120.png
├── icon-87.png
├── icon-80.png
├── icon-60.png
├── icon-58.png
├── icon-40.png
└── icon-29.png
```

### Android:
```
mobile/android/app/src/main/res/
├── mipmap-mdpi/
│   └── ic_launcher.png (48x48)
├── mipmap-hdpi/
│   └── ic_launcher.png (72x72)
├── mipmap-xhdpi/
│   └── ic_launcher.png (96x96)
├── mipmap-xxhdpi/
│   └── ic_launcher.png (144x144)
└── mipmap-xxxhdpi/
    └── ic_launcher.png (192x192)
```

## Splash Screen com Expo:

### app.json:
```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "icon": "./assets/images/icon.png",
      "supportsTablet": true
    },
    "android": {
      "icon": "./assets/images/icon.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

## Adaptive Icon (Android Only):

Android usa "Adaptive Icons" que se adaptam a diferentes formatos de launcher.

### Arquivos Necessários:
1. **Foreground**: Elemento principal (logo) - 432x432px
   - Área segura: 264x264px (centro)
   - Nome: `adaptive-icon-foreground.png`

2. **Background**: Cor sólida ou padrão - 432x432px
   - Nome: `adaptive-icon-background.png`

### Exemplo de Config:
```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/images/adaptive-icon-foreground.png",
    "backgroundImage": "./assets/images/adaptive-icon-background.png"
  }
}
```

## Checklist de Implementação:

### Design:
- [ ] Criar logo 1024x1024 (sem transparência para iOS)
- [ ] Criar versão com transparência para Android adaptive
- [ ] Criar splash screen 1242x2688
- [ ] Validar cores da marca (#20a490)
- [ ] Testar legibilidade em diferentes tamanhos

### Geração de Assets:
- [ ] Gerar todos os tamanhos iOS (9 tamanhos)
- [ ] Gerar todos os tamanhos Android (5 densidades)
- [ ] Criar adaptive icon para Android
- [ ] Otimizar PNGs (comprimir sem perder qualidade)

### Configuração:
- [ ] Adicionar assets em `/mobile/assets/images/`
- [ ] Atualizar `app.json` com caminhos corretos
- [ ] Configurar iOS: `Images.xcassets/AppIcon.appiconset/`
- [ ] Configurar Android: `res/mipmap-*/`
- [ ] Atualizar `Contents.json` no iOS

### Testes:
- [ ] Build de desenvolvimento e verificar ícone
- [ ] Testar splash screen no launch
- [ ] Verificar em diferentes dispositivos iOS
- [ ] Verificar em diferentes dispositivos Android
- [ ] Validar adaptive icon em Android (círculo, quadrado, squircle)

## Dicas de Design:

### Cores Elosaúde:
```
Primary:   #20a490 (Verde água)
Secondary: #1a8c7a (Verde escuro)
Accent:    #4caf50 (Verde claro)
White:     #FFFFFF
Light:     #F5F9F8
```

### Elementos Visuais:
- Cruz médica (+)
- Coração
- Escudo (proteção)
- Família (pessoas)
- Folha (saúde natural)

### Inspiração:
- Doctolib
- Plum
- One Medical
- Teladoc
- ZocDoc

## Validação Pré-Lançamento:

### iOS App Store:
- Ícone 1024x1024 sem alpha channel
- Sem bordas arredondadas (iOS faz automaticamente)
- Sem transparência

### Google Play Store:
- Ícone 512x512
- 32-bit PNG com alpha
- Adaptive icon obrigatório para API 26+

## Ferramentas de Preview:

1. **iOS**: https://appicon.build/
   - Preview em diferentes contextos iOS

2. **Android**: https://adapticon.tooo.io/
   - Preview do adaptive icon em diferentes launchers

3. **Ambos**: https://www.figma.com/community/plugin/758276196168548601/App-Icon-Preview
   - Plugin Figma

## Próximos Passos:

1. **Contratar Designer** ou usar ferramentas como:
   - Canva Pro
   - Figma
   - Adobe Illustrator
   - Sketch

2. **Gerar Assets** usando ferramentas mencionadas

3. **Configurar no Projeto**:
```bash
# Após ter os assets
cd mobile
expo prebuild
# ou
npx react-native run-ios
npx react-native run-android
```

4. **Testar** em dispositivos reais

## Custo Estimado:

- **DIY (Você mesmo)**: Gratuito - 4h de trabalho
- **Freelancer Fiverr**: $20-50
- **Designer Profissional**: $100-300
- **Agência**: $500-2000

## Referências:

- Apple HIG Icons: https://developer.apple.com/design/human-interface-guidelines/app-icons
- Material Design Icons: https://material.io/design/iconography/product-icons.html
- Expo Icons Guide: https://docs.expo.dev/develop/user-interface/app-icons/
