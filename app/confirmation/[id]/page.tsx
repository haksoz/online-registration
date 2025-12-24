import { redirect } from 'next/navigation'

interface ConfirmationPageProps {
  params: {
    id: string
  }
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  // Bu sayfa şu an kullanılmıyor
  // Confirmation işlemi Step4Confirmation component'i ile yapılıyor
  // Gelecekte kullanılabilir, şimdilik ana sayfaya yönlendiriyoruz
  redirect('/')
}

