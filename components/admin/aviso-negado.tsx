/** Mostrado quando um usuário tenta abrir uma área que seu papel não permite (RN#34). */
export function AvisoNegado({ visivel }: { visivel: boolean }) {
  if (!visivel) return null
  return (
    <p
      role="alert"
      className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
    >
      Seu perfil não tem permissão para acessar aquela área.
    </p>
  )
}
