import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Image, 
  Palette, 
  Wand2, 
  PenTool,
  Layers,
  Eye,
  ArrowRight,
  CheckCircle,
  Layout,
  CircleDollarSign,
  Clock
} from 'lucide-react';
import StartForm from '../components/StartForm';

const CreationVisuellePage: React.FC = () => {
  const [showStartForm, setShowStartForm] = useState(false);

  const capabilities = [
    {
      icon: Wand2,
      title: "Génération à partir de description",
      description: "Créez des visuels uniques simplement en décrivant ce que vous souhaitez obtenir"
    },
    {
      icon: Palette,
      title: "Personnalisation avancée",
      description: "Affinez le style, les couleurs et l'ambiance pour obtenir exactement le visuel dont vous avez besoin"
    },
    {
      icon: Layout,
      title: "Formats adaptés",
      description: "Générez des visuels pour tous vos supports : web, réseaux sociaux, print, packaging..."
    },
    {
      icon: Layers,
      title: "Variations infinies",
      description: "Explorez différentes variations d'un même concept pour trouver l'image parfaite"
    }
  ];

  const useCases = [
    {
      title: "Marketing digital",
      description: "Images captivantes pour vos campagnes sur les réseaux sociaux et le web",
      examples: [
        "Posts Instagram et Facebook",
        "Bannières publicitaires",
        "Visuels pour newsletters",
        "Couvertures de blogs"
      ],
      image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&auto=format&fit=crop&q=80"
    },
    {
      title: "E-commerce",
      description: "Mises en situation de produits et variations de packaging",
      examples: [
        "Photos produits professionnelles",
        "Mises en situation d'utilisation",
        "Variations de packaging",
        "Images lifestyle"
      ],
      image: "https://images.unsplash.com/photo-1633174524827-db00a6b7bc74?w=800&auto=format&fit=crop&q=80"
    },
    {
      title: "Communication d'entreprise",
      description: "Illustrations et infographies pour vos supports de communication",
      examples: [
        "Illustrations de concepts",
        "Infographies explicatives",
        "Visuels pour présentations",
        "Rapports annuels"
      ],
      image: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800&auto=format&fit=crop&q=80"
    }
  ];

  const samplePrompts = [
    "Une vue aérienne d'un quartier d'affaires moderne avec des immeubles de verre et d'acier, ambiance dynamique, style photo réaliste",
    "Un visuel abstrait représentant la transformation numérique avec des lignes bleues et violettes qui se connectent sur fond blanc, style minimaliste",
    "La salle de réunion d'une startup innovante avec des personnes diverses travaillant ensemble, ambiance chaleureuse, style photo professionnelle",
    "Un concept visuel représentant l'intelligence artificielle avec un cerveau stylisé et des connexions lumineuses, fond sombre, style futuriste"
  ];

  // Sample Gallery
  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800&auto=format&fit=crop&q=80",
      prompt: "Concept d'innovation technologique avec des formes géométriques bleues et violettes"
    },
    {
      url: "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800&auto=format&fit=crop&q=80",
      prompt: "Image de produit sur fond dégradé bleu avec éclairage studio professionnel"
    },
    {
      url: "https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?w=800&auto=format&fit=crop&q=80",
      prompt: "Bureau moderne avec ordinateur et accessoires design, style épuré et minimaliste"
    },
    {
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      prompt: "Formes abstraites 3D avec dégradés bleus et violets sur fond noir"
    },
    {
      url: "https://images.unsplash.com/photo-1637611331620-51149c7ceb94?w=800&auto=format&fit=crop&q=80",
      prompt: "Ambiance urbaine futuriste de nuit avec néons et reflets sur sol mouillé"
    },
    {
      url: "https://images.unsplash.com/photo-1664575599736-c5197c684de0?w=800&auto=format&fit=crop&q=80",
      prompt: "Scène d'entreprise avec personnes en réunion dans un espace de coworking moderne"
    }
  ];

  return (
    <section className="pt-20 bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>Création Visuelle IA | AImagination</title>
        <meta name="description" content="Générez des images de qualité professionnelle pour tous vos besoins marketing et communication grâce à notre solution de création visuelle propulsée par l'IA." />
      </Helmet>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex gap-2 items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <Image className="w-4 h-4" />
              <span>Génération d'images IA</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Des visuels <span className="text-indigo-600">professionnels</span> en quelques minutes
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Générez des images uniques et personnalisées pour tous vos besoins marketing
              et communication, sans compétences techniques, grâce à l'intelligence artificielle.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setShowStartForm(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg"
              >
                Essayer gratuitement
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setShowStartForm(true)}
                className="bg-white border border-indigo-200 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Voir des exemples
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=1200&auto=format&fit=crop&q=80"
              alt="Création d'images avec l'IA"
              className="relative rounded-xl shadow-xl w-full"
            />
          </div>
        </div>
      </div>

      {/* Key Capabilities */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Des possibilités créatives infinies
          </h2>
          <p className="text-lg text-gray-600">
            Notre technologie de pointe vous permet de créer sans limites
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {capabilities.map((capability, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-5">
                <capability.icon className="w-7 h-7 text-indigo-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {capability.title}
              </h3>
              
              <p className="text-gray-600">
                {capability.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Galerie d'exemples
            </h2>
            <p className="text-lg text-gray-600">
              Des créations générées par notre IA à partir de simples descriptions textuelles
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="aspect-w-16 aspect-h-9 h-48 w-full">
                  <img
                    src={image.url}
                    alt={`Image générée par IA #${index+1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm italic">
                    "{image.prompt}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Applications concrètes
          </h2>
          <p className="text-lg text-gray-600">
            Des solutions visuelles pour tous vos besoins métier
          </p>
        </div>
        
        <div className="space-y-16">
          {useCases.map((useCase, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-8 items-center">
              <div className={index % 2 === 0 ? "order-1" : "order-1 md:order-2"}>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-indigo-600" />
                  {useCase.title}
                </h3>
                
                <p className="text-gray-600 mb-6 text-lg">
                  {useCase.description}
                </p>
                
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-indigo-600" />
                    Exemples d'applications
                  </h4>
                  
                  <ul className="space-y-2">
                    {useCase.examples.map((example, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  onClick={() => setShowStartForm(true)}
                  className="text-indigo-600 font-semibold flex items-center gap-2 hover:text-indigo-800"
                >
                  En savoir plus
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className={index % 2 === 0 ? "order-2" : "order-2 md:order-1"}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
                  <img 
                    src={useCase.image}
                    alt={useCase.title}
                    className="relative rounded-xl shadow-xl w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Examples */}
      <div className="bg-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Exemples de prompts
            </h2>
            <p className="text-lg text-gray-600">
              Inspirez-vous de ces descriptions textuelles pour créer vos propres visuels
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {samplePrompts.map((prompt, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow">
                <p className="text-gray-700 italic">"{prompt}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Overview */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Une solution abordable et sans engagement
          </h2>
          <p className="text-lg text-gray-600">
            Des tarifs flexibles adaptés à vos besoins
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-transparent hover:border-indigo-100 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <CircleDollarSign className="w-7 h-7 text-indigo-600" />
              <h3 className="text-2xl font-bold text-gray-900">Pay as you go</h3>
            </div>
            <p className="text-gray-600 mb-5">Idéal pour les besoins ponctuels</p>
            <div className="text-3xl font-bold text-indigo-600 mb-5">1€ <span className="text-base font-normal text-gray-600">/ image</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">Haute résolution (4K)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">Droits commerciaux</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">Assistance par email</span>
              </li>
            </ul>
            <button 
              onClick={() => setShowStartForm(true)}
              className="w-full py-2.5 px-4 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Commencer gratuitement
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-indigo-600 relative transform scale-105">
            <div className="absolute -top-4 right-8 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              Le plus populaire
            </div>
            <div className="flex items-center gap-3 mb-5">
              <Image className="w-7 h-7 text-indigo-600" />
              <h3 className="text-2xl font-bold text-gray-900">Abonnement Pro</h3>
            </div>
            <p className="text-gray-600 mb-5">Pour un usage régulier</p>
            <div className="text-3xl font-bold text-indigo-600 mb-5">49€ <span className="text-base font-normal text-gray-600">/ mois</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">100 images par mois</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">Haute résolution (4K)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">Styles personnalisés</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">Support prioritaire</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">Droits commerciaux</span>
              </li>
            </ul>
            <button 
              onClick={() => setShowStartForm(true)}
              className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Démarrer l'essai gratuit
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 border border-transparent hover:border-indigo-100 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <Layers className="w-7 h-7 text-indigo-600" />
              <h3 className="text-2xl font-bold text-gray-900">Business</h3>
            </div>
            <p className="text-gray-600 mb-5">Pour les équipes</p>
            <div className="text-3xl font-bold text-indigo-600 mb-5">199€ <span className="text-base font-normal text-gray-600">/ mois</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">500 images par mois</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">Ultra haute définition (8K)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">Utilisateurs multiples</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">API pour intégration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">Support dédié 24/7</span>
              </li>
            </ul>
            <button 
              onClick={() => setShowStartForm(true)}
              className="w-full py-2.5 px-4 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Contacter l'équipe commerciale
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-6">
                Propulsez votre communication visuelle
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                Plus besoin de compétences en design ou de budget pour des photographes professionnels.
                Créez des visuels d'exception dès maintenant.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">Économisez des heures de travail</span>
                </div>
                <div className="flex items-center gap-3">
                  <CircleDollarSign className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">Réduisez vos coûts de production</span>
                </div>
                <div className="flex items-center gap-3">
                  <PenTool className="w-6 h-6 text-yellow-300" />
                  <span className="text-indigo-100">Créez sans limites créatives</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Commencez gratuitement
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">5 images gratuites pour tester</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Accès à tous les styles et formats</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Téléchargement haute résolution</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Assistance pour vos premiers pas</span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowStartForm(true)}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                Créer ma première image
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <StartForm 
        isOpen={showStartForm} 
        onClose={() => setShowStartForm(false)} 
      />
    </section>
  );
};

export default CreationVisuellePage;