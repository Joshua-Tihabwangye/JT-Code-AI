import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  type Resolver,
  type SubmitHandler,
} from 'react-hook-form';
import { signinSchema, type SignInSchema } from '../schema';
import type { SignInPayload } from '../types';

interface UseSignInFormResult {
  form: ReturnType<typeof useForm<SignInSchema>>;
  submit: SubmitHandler<SignInSchema>;
}

export function useSignInForm(
  onSubmit: (payload: SignInPayload) => Promise<void>,
): UseSignInFormResult {
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signinSchema) as Resolver<SignInSchema>,
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const submit: SubmitHandler<SignInSchema> = async (values) => {
    await onSubmit({ email: values.email, password: values.password });
  };

  return { form, submit };
}
