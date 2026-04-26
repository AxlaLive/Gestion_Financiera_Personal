import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../Signup';

const { mockPost, mockNavigate, mockToastSuccess } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockNavigate: vi.fn(),
  mockToastSuccess: vi.fn(),
}));

vi.mock('../../api/axios', () => ({
  default: { post: mockPost },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom'
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('sonner', () => ({
  toast: { success: mockToastSuccess },
}));

const renderSignup = () =>
  render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );

const fillField = (labelMatcher: RegExp, value: string) => {
  const input = screen.getByLabelText(labelMatcher);
  fireEvent.change(input, { target: { value } });
  return input;
};

const fillValidForm = () => {
  fillField(/nombre completo/i, 'María González');
  fillField(/correo electrónico/i, 'maria@example.com');
  fillField(/^contraseña$/i, 'MiClave2026!');
  fillField(/confirmar contraseña/i, 'MiClave2026!');
};

beforeEach(() => {
  mockPost.mockReset();
  mockNavigate.mockReset();
  mockToastSuccess.mockReset();
  const store: Record<string, string> = {};
  Object.defineProperty(window, 'localStorage', {
    writable: true,
    value: {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
    },
  });
});

describe('Signup (HU-01)', () => {
  it('Escenario 1: registro exitoso redirige al dashboard y muestra toast', async () => {
    mockPost.mockImplementation(() =>
      Promise.resolve({ data: { id: 1, correo: 'maria@example.com' } })
    );

    renderSignup();
    fillValidForm();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /registrarme/i }));
    });

    expect(mockPost).toHaveBeenCalledWith('/usuarios/registro', {
      nombre: 'María González',
      correo: 'maria@example.com',
      password: 'MiClave2026!',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(mockToastSuccess).toHaveBeenCalled();
  });

  it('Escenario 2: correo duplicado muestra el mensaje del backend', async () => {
    mockPost.mockImplementation(() =>
      Promise.reject({
        response: { data: 'El correo ya está registrado en el sistema' },
      })
    );

    renderSignup();
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /registrarme/i }));

    expect(
      await screen.findByText(/el correo ya está registrado en el sistema/i)
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('Escenario 3a: correo con formato inválido muestra error y no envía', () => {
    renderSignup();
    fillField(/nombre completo/i, 'María González');
    const email = fillField(/correo electrónico/i, 'usuario@');
    fireEvent.blur(email);

    expect(screen.getByText(/correo inválido/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /registrarme/i }));
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('Escenario 3b: contraseña débil muestra error y no envía', () => {
    renderSignup();
    fillField(/nombre completo/i, 'María González');
    fillField(/correo electrónico/i, 'maria@example.com');
    fillField(/^contraseña$/i, 'abc');
    fillField(/confirmar contraseña/i, 'abc');

    fireEvent.click(screen.getByRole('button', { name: /registrarme/i }));

    expect(
      screen.getByText(/la contraseña no cumple los requisitos/i)
    ).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('Escenario 4: contraseñas no coinciden muestra error y no envía', () => {
    renderSignup();
    fillField(/nombre completo/i, 'María González');
    fillField(/correo electrónico/i, 'maria@example.com');
    fillField(/^contraseña$/i, 'MiClave2026!');
    fillField(/confirmar contraseña/i, 'OtraClave2026!');

    fireEvent.click(screen.getByRole('button', { name: /registrarme/i }));

    expect(
      screen.getByText(/las contraseñas no coinciden/i)
    ).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('no muestra errores antes de que el usuario interactúe', () => {
    renderSignup();
    expect(
      screen.queryByText(/el nombre completo es requerido/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/el correo electrónico es requerido/i)
    ).not.toBeInTheDocument();
  });
});
