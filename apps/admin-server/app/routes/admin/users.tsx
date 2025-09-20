import type { MetaFunction } from "react-router";

interface TechItem {
  name: string;
  description: string;
  icon: string;
}

interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

interface LoaderData {
  techStack: TechItem[];
  features: FeatureItem[];
}

export const meta: MetaFunction = () => {
  return [
    { title: "关于我们 - Fun Box" },
    { name: "description", content: "了解 Fun Box 文件管理系统的技术架构和特性" },
  ];
};

export async function loader(): Promise<LoaderData> {
  // 模拟异步数据加载
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    techStack: [
      {
        name: "React Router v7",
        description: "现代化的 React 路由解决方案，支持数据加载和类型安全",
        icon: "⚛️"
      },
      {
        name: "TypeScript",
        description: "提供类型安全和更好的开发体验",
        icon: "📘"
      },
      {
        name: "Tailwind CSS",
        description: "实用优先的 CSS 框架，快速构建现代化界面",
        icon: "🎨"
      },
      {
        name: "Vite",
        description: "快速的构建工具和开发服务器",
        icon: "⚡"
      }
    ],
    features: [
      {
        title: "文件管理",
        description: "支持文件上传、预览、组织和管理",
        icon: "📁"
      },
      {
        title: "响应式设计",
        description: "适配各种设备和屏幕尺寸",
        icon: "📱"
      },
      {
        title: "主题切换",
        description: "支持明暗主题切换",
        icon: "🌙"
      },
      {
        title: "现代化界面",
        description: "采用最新的设计趋势和用户体验",
        icon: "✨"
      }
    ]
  };
}

export default function About({ loaderData }: { loaderData: LoaderData }) {
  const { techStack, features } = loaderData;

  return (
    <div className="h-full">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          关于 Fun Box
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Fun Box 是一个现代化的文件管理和预览系统，致力于为用户提供简洁、高效的文件操作体验。
        </p>
      </div>

        {/* 技术栈 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            技术架构
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((tech: TechItem, index: number) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{tech.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {tech.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {tech.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 功能特性 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            核心功能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature: FeatureItem, index: number) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 项目信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            项目愿景
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-4xl mx-auto leading-relaxed">
            我们致力于创建一个简单、高效、美观的文件管理解决方案。
            通过现代化的技术栈和用户体验设计，让文件管理变得更加轻松愉快。
            Fun Box 不仅仅是一个工具，更是一个展示现代 Web 开发最佳实践的平台。
          </p>
        </div>
      </div>
    );
  }