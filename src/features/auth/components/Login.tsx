import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import LoginForm from './LoginForm'
import logo from '../../../assets/logo.png'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  return (
    <div className="flex min-h-screen w-full max-w-full items-stretch justify-start overflow-x-hidden bg-[radial-gradient(circle_at_top,#eef2ff_0,#f3f4f6_55%,#e5e7eb)] px-4 py-6 md:px-0 md:py-0">
      <div className="grid w-full min-h-full grid-cols-1 gap-4 md:min-h-screen md:min-w-0 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-7 md:flex-1">
        <section
          className="relative hidden min-h-full overflow-hidden bg-cover bg-center md:block"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.5)), url('https://images.pexels.com/photos/4761663/pexels-photo-4761663.jpeg?auto=compress&cs=tinysrgb&w=1600')`,
          }}
        >
          <div className="relative flex h-full max-w-[30rem] flex-col justify-center pb-[2.6rem] pl-[4.5rem] pr-[2.2rem] pt-[2.4rem]">
            <img
              src={logo}
              alt="Inspire Institute of Sport"
              className="mb-2 block h-auto max-h-12 w-auto max-w-[180px] object-contain"
            />
            <p className="m-0 text-[0.85rem] font-semibold uppercase tracking-[0.25em] text-sky-200">
              High performance athlete analytics
            </p>
            <h1 className="mt-1.5 text-[2.6rem] font-normal tracking-tight text-slate-50">
              Inspire Institute of Sport
            </h1>
            <p className="mt-3 text-[1.15rem] text-slate-200">
              Securely upload session footage, select a sport and metric, and
              review video-driven performance insights.
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <div className="min-w-[6.5rem]">
                <span className="block text-[1.4rem] font-semibold text-slate-200">500+</span>
                <span className="mt-0.5 block text-[0.9rem] uppercase tracking-widest text-indigo-200">
                  Athletes
                </span>
              </div>
              <div className="min-w-[6.5rem]">
                <span className="block text-[1.4rem] font-semibold text-slate-200">6</span>
                <span className="mt-0.5 block text-[0.9rem] uppercase tracking-widest text-indigo-200">
                  Sports
                </span>
              </div>
              <div className="min-w-[6.5rem]">
                <span className="block text-[1.4rem] font-semibold text-slate-200">24/7</span>
                <span className="mt-0.5 block text-[0.9rem] uppercase tracking-widest text-indigo-200">
                  Video insights
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="flex min-h-0 flex-1 items-center justify-center overflow-auto py-4 md:min-h-full md:py-8">
          <LoginForm
            onLogin={login}
            onSwitchToSignup={() => navigate('/register')}
          />
        </section>
      </div>
    </div>
  )
}
