import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { StatusPill } from '../components/ui/StatusPill';
import { register as apiRegister } from '../services/auth.service';
import { useAuthStore } from '../context/authStore';
import { extractErrorMessage } from '../services/api';

const schema = z
  .object({
    name: z.string().trim().min(1, 'Required').max(80),
    email: z.string().trim().toLowerCase().email('Enter a valid email'),
    password: z.string().min(8, 'Min 8 characters').max(128),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

export function RegisterPage(): JSX.Element {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirm: '' },
  });

  const onSubmit = async (values: FormValues): Promise<void> => {
    setSubmitting(true);
    try {
      const result = await apiRegister({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      setSession(result);
      toast.success(`OPERATOR_${result.user.name.toUpperCase()} ENROLLED`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err, 'ENROLLMENT FAILURE'));
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
          <StatusPill tone="orange">NEW OPERATOR INTAKE</StatusPill>
        </div>

        <GlassPanel emissive="orange" rounded="xl" padding="lg" bg="mid" className="flex flex-col gap-md">
          <header className="flex flex-col gap-xs border-b border-outline-variant/30 pb-md">
            <span className="label-tactical">// REQUEST CLEARANCE</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Operator Enrollment</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Provision a new tactical account.
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md" noValidate>
            <Input
              label="Callsign"
              type="text"
              autoComplete="name"
              iconLeft={<Icon name="badge" className="text-base" />}
              error={errors.name?.message}
              {...register('name')}
            />
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
              autoComplete="new-password"
              iconLeft={<Icon name="lock" className="text-base" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              iconLeft={<Icon name="lock_reset" className="text-base" />}
              error={errors.confirm?.message}
              {...register('confirm')}
            />
            <Button type="submit" variant="primary" block loading={submitting}>
              Provision Account
            </Button>
          </form>

          <div className="border-t border-outline-variant/30 pt-md flex items-center justify-between gap-sm">
            <span className="font-label-caps text-[11px] text-on-surface-variant tracking-widest uppercase">
              Existing operator?
            </span>
            <Link
              to="/login"
              className="font-label-caps text-label-caps text-secondary-container tracking-widest uppercase hover:text-shadow-cyan transition-all"
            >
              Authenticate →
            </Link>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
