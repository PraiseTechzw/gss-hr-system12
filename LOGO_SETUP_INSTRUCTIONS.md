# Logo Setup Instructions

## How to Add Your Custom Logo

### Option 1: Replace the Default Logo
1. **Add your logo image** to the `public/` folder
2. **Name it** `logo.png` (or update the path in the code)
3. **Recommended size**: 64x64px or 128x128px for best quality
4. **Supported formats**: PNG, JPG, SVG

### Option 2: Use the Custom Logo Component
\`\`\`tsx
import { CustomLogo } from '@/components/ui/app-logo'

// In your component
<CustomLogo 
  imagePath="/your-logo.png" 
  size="lg" 
  showText={true} 
/>
\`\`\`

### Option 3: Create a Logo with Text
If you want to create a logo with your company name, you can:

1. **Use the existing gradient logo** (already looks professional)
2. **Customize the colors** in the `app-logo.tsx` file
3. **Change the icon** from `Building2` to any other Lucide icon
4. **Modify the text** from "GSS HR" to your company name

## Current Logo Features

### 🎨 **Design Elements**
- **Gradient background**: Blue to red (your brand colors)
- **Professional icon**: Building2 (represents HR/company)
- **Animated elements**: Subtle animations for modern look
- **Responsive sizing**: Works on all screen sizes
- **Multiple variants**: Default, minimal, detailed, icon-only

### 🔧 **Available Logo Variants**

1. **Default Logo** (with text)
\`\`\`tsx
<AppLogo size="lg" showText={true} />
\`\`\`

2. **Minimal Logo** (clean design)
\`\`\`tsx
<AppLogo variant="minimal" size="md" showText={true} />
\`\`\`

3. **Detailed Logo** (with animations)
\`\`\`tsx
<AppLogo variant="detailed" size="lg" showText={true} />
\`\`\`

4. **Icon Only** (just the logo)
\`\`\`tsx
<AppLogo variant="icon-only" size="md" />
\`\`\`

5. **Custom Image Logo**
\`\`\`tsx
<CustomLogo imagePath="/your-logo.png" size="lg" showText={true} />
\`\`\`

## Customization Options

### 🎨 **Change Colors**
Edit the gradient in `app-logo.tsx`:
\`\`\`tsx
// Change from blue-red to your colors
className="bg-gradient-to-br from-blue-600 to-red-600"
// To your colors:
className="bg-gradient-to-br from-purple-600 to-green-600"
\`\`\`

### 🔄 **Change Icon**
Replace `Building2` with any Lucide icon:
\`\`\`tsx
import { Users, Shield, Briefcase, Star } from 'lucide-react'

// Use different icon
<Users className="w-1/2 h-1/2 text-white" />
\`\`\`

### 📝 **Change Text**
Update the text in the component:
\`\`\`tsx
<span className="font-bold text-white">
  YOUR COMPANY NAME
</span>
\`\`\`

## Logo Usage Examples

### In Header
\`\`\`tsx
import AppLogo from '@/components/ui/app-logo'

<AppLogo size="md" showText={true} />
\`\`\`

### In Login Page
\`\`\`tsx
import { LoginPageLogo } from '@/components/ui/app-logo'

<LoginPageLogo />
\`\`\`

### In Sidebar
\`\`\`tsx
import AppLogo from '@/components/ui/app-logo'

<AppLogo variant="minimal" size="sm" showText={false} />
\`\`\`

## File Structure
\`\`\`
public/
├── logo.png          # Your custom logo (optional)
└── favicon.ico       # Browser favicon

components/ui/
└── app-logo.tsx      # Logo component with all variants
\`\`\`

## Quick Setup
1. **For immediate use**: The current logo already looks professional
2. **For custom logo**: Add your image to `public/logo.png`
3. **For custom colors**: Edit the gradient in `app-logo.tsx`
4. **For custom text**: Update the text in the component

The logo system is designed to be flexible and professional, with your brand colors (blue and red) already integrated!
