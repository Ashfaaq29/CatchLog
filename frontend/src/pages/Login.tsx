import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { StatusPill } from '../components/ui/StatusPill';
import { login } from '../services/auth.service';
import { useAuthStore } from '../context/authStore';
import { extractErrorMessage } from '../services/api';

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'Min 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage(): JSX.Element {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues): Promise<void> => {
    setSubmitting(true);
    try {
      const result = await login(values);
      setSession(result);
      toast.success(`UPLINK ESTABLISHED // OPERATOR_${result.user.name.toUpperCase()}`);
      const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err, 'AUTH FAILURE'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-md py-xl">
      <div className="w-full max-w-md flex flex-col gap-md">
        <div className="flex flex-col items-center gap-xs">
          <div className="flex items-center gap-sm">
            <Icon name="radar" className="text-primary text-3xl" />
            <h1 className="font-label-caps text-headline-sm tracking-widest text-primary">
              ANGLER_OS
            </h1>
          </div>
          <StatusPill tone="cyan">SECURE UPLINK</StatusPill>
        </div>

        <GlassPanel emissive="cyan" rounded="xl" padding="lg" bg="mid" className="flex flex-col gap-md">
          <header className="flex flex-col gap-xs border-b border-outline-variant/30 pb-md">
            <span className="label-tactical">// AUTHENTICATE</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Operator Login</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Enter credentials to access tactical feed.
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md" noValidate>
            <Input
              label="Email Channel"
              type="email"
              autoComplete="email"
              iconLeft={<Icon name="alternate_email" className="text-base" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              iconLeft={<Icon name="lock" className="text-base" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" variant="primary" block loading={submitting}>
              Establish Uplink
            </Button>
          </form>

          <div className="border-t border-outline-variant/30 pt-md flex items-center justify-between gap-sm">
            <span className="font-label-caps text-[11px] text-on-surface-variant tracking-widest uppercase">
              No clearance?
            </span>
            <Link
              to="/register"
              className="font-label-caps text-label-caps text-secondary-container tracking-widest uppercase hover:text-shadow-cyan transition-all"
            >
              Request Access →
            </Link>
          </div>
        </GlassPanel>

        <p className="text-center font-label-caps text-[10px] text-on-surface-variant/60 tracking-widest uppercase">
          // CATCHLOG_v1.0 // SECTOR_01 // AES_BACKED
        </p>
      </div>
    </div>
  );
}
