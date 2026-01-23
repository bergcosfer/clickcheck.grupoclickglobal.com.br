import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  Package,
  ClipboardList,
  Edit3,
  Shield,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react'

function WikiSection({ title, icon: Icon, children }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        {title}
      </h2>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

function StepCard({ number, title, description, tips }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-slate-900 mb-1">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
          {tips && tips.length > 0 && (
            <div className="mt-3 bg-amber-50 rounded-lg p-3">
              <p className="text-xs font-medium text-amber-700 flex items-center gap-1 mb-1">
                <Lightbulb className="w-3 h-3" />
                Dicas
              </p>
              <ul className="text-xs text-amber-600 space-y-1">
                {tips.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Wiki() {
  const { isUser, isAdmin, isGuest } = useAuth()

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Acesso Restrito</h2>
        <p className="text-slate-500">A Wiki está disponível apenas para usuários e administradores.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          Wiki do Sistema
        </h1>
        <p className="text-slate-500 mt-1">Guia completo de utilização do Clickcheck</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-emerald-800 mb-2">Bem-vindo ao Clickcheck!</h2>
        <p className="text-emerald-700">
          Este sistema foi desenvolvido para facilitar o processo de validação e aprovação de conteúdos
          em sua equipe. Aqui você encontra todas as informações necessárias para utilizar a plataforma.
        </p>
      </div>

      {/* Pacotes Section */}
      {isAdmin && (
        <WikiSection title="Gerenciando Pacotes de Validação" icon={Package}>
          <StepCard
            number={1}
            title="Acessar Gerenciamento de Pacotes"
            description="Navegue até a página 'Pacotes' no menu lateral. Aqui você verá todos os modelos de validação cadastrados."
          />
          <StepCard
            number={2}
            title="Criar Novo Pacote"
            description="Clique em 'Novo Pacote' e preencha: nome, descrição, tipo de conteúdo (artwork, texto, vídeo, etc.) e os critérios de validação."
            tips={[
              "Defina critérios claros e objetivos",
              "Use pesos maiores para critérios mais importantes",
              "Marque como 'Obrigatório' os critérios essenciais"
            ]}
          />
          <StepCard
            number={3}
            title="Ativar/Desativar Pacotes"
            description="Use o switch de ativação para controlar quais pacotes estão disponíveis para uso. Pacotes inativos não aparecem na criação de validações."
          />
        </WikiSection>
      )}

      {/* Validações Section */}
      <WikiSection title="Criando Validações" icon={ClipboardList}>
        <StepCard
          number={1}
          title="Iniciar Nova Validação"
          description="Acesse 'Nova Validação' no menu. Preencha o título descritivo e uma descrição opcional com contexto adicional."
        />
        <StepCard
          number={2}
          title="Selecionar Pacote e Prioridade"
          description="Escolha o pacote de validação apropriado para o tipo de conteúdo. Defina a prioridade que determinará o prazo automático."
          tips={[
            "Baixa: 24 horas para validação",
            "Normal: 12 horas para validação",
            "Alta: 6 horas para validação",
            "Urgente: 2 horas para validação"
          ]}
        />
        <StepCard
          number={3}
          title="Adicionar Links e Designar Validador"
          description="Adicione um ou mais links de conteúdo para serem validados. Escolha quem será responsável pela validação."
        />
      </WikiSection>

      {/* Correções Section */}
      <WikiSection title="Corrigindo Conteúdo" icon={Edit3}>
        <StepCard
          number={1}
          title="Identificar Links Reprovados"
          description="Quando sua validação retornar como 'Reprovado' ou 'Aprovado Parcial', você receberá detalhes sobre quais links precisam de correção."
        />
        <StepCard
          number={2}
          title="Enviar Correção"
          description="Na Central de Validação, clique em 'Corrigir' na solicitação. Substitua os links reprovados pelos links corrigidos e adicione observações."
          tips={[
            "Leia as observações do validador antes de corrigir",
            "Cada correção conta como retorno (-1 ponto no ranking)"
          ]}
        />
        <StepCard
          number={3}
          title="Acompanhar Revalidação"
          description="Após enviar a correção, a solicitação volta ao status 'Pendente' e aguarda nova validação do responsável."
        />
      </WikiSection>

      {/* Admin Section */}
      {isAdmin && (
        <WikiSection title="Gestão de Usuários e Reversões" icon={Shield}>
          <StepCard
            number={1}
            title="Gerenciar Níveis de Acesso"
            description="Na página 'Usuários', você pode alterar o nível de acesso de cada usuário: Convidado, Usuário ou Admin Principal."
            tips={[
              "Convidado: Só valida o que recebe",
              "Usuário: Cria e valida conteúdo",
              "Admin Principal: Acesso total ao sistema"
            ]}
          />
          <StepCard
            number={2}
            title="Reverter Aprovações"
            description="Se uma aprovação foi concedida por engano, você pode revertê-la na Central de Validação. A solicitação volta para 'Pendente'."
          />
          <StepCard
            number={3}
            title="Monitorar Relatórios"
            description="Acesse 'Relatórios' para visualizar métricas detalhadas: taxa de aprovação, tempo médio de validação, desempenho por usuário e mais."
          />
        </WikiSection>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Boas Práticas
        </h3>
        <ul className="text-blue-700 space-y-2">
          <li>✓ Sempre forneça descrições claras nas validações</li>
          <li>✓ Respeite os prazos conforme a prioridade definida</li>
          <li>✓ Adicione observações construtivas ao reprovar conteúdo</li>
          <li>✓ Mantenha seu perfil atualizado com foto e apelido</li>
          <li>✓ Verifique a Central regularmente para novas validações</li>
        </ul>
      </div>
    </div>
  )
}
