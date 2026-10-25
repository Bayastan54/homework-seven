import { useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';

interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
}

const apiUrl = 'https://inai-col1.fishrungames.com';

function App() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');

  async function loadAds() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/ads`);
      if (!response.ok) throw new Error('Ошибка загрузки');

      const data = await response.json();
      if (!Array.isArray(data.items)) throw new Error('Неверный формат списка');
      setAds(data.items);
    } catch {
      setError('Не удалось загрузить объявления. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAds();
  }, []);

  async function addAd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get('title') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();
    const priceText = String(data.get('price') ?? '').trim();
    const price = Number(priceText);
    const image = data.get('image');

    setFormError('');
    setMessage('');

    if (!title || !description || !priceText || !Number.isFinite(price) || price < 0) {
      setFormError('Заполните все поля. Цена должна быть не меньше нуля.');
      return;
    }
    if (!(image instanceof File) || image.size === 0 || !image.type.startsWith('image/')) {
      setFormError('Выберите файл с изображением.');
      return;
    }

    data.set('title', title);
    data.set('description', description);
    data.set('price', String(price));
    setSending(true);

    try {
      // Content-Type добавит браузер вместе с границей multipart/form-data.
      const response = await fetch(`${apiUrl}/ads`, {
        method: 'POST',
        body: data,
      });
      if (!response.ok) throw new Error('Ошибка отправки');

      form.reset();
      setMessage('Объявление добавлено!');
      await loadAds();
    } catch {
      setFormError('Не удалось отправить объявление. Попробуйте ещё раз.');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <section className="card mb-4">
        <div className="card-body">
          <h2 className="h4 mb-3">Добавить объявление</h2>
          <form onSubmit={addAd}>
            <fieldset disabled={sending}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Название</label>
                <input id="title" name="title" className="form-control" required />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Описание</label>
                <textarea id="description" name="description" className="form-control" rows={3} required />
              </div>
              <div className="mb-3">
                <label htmlFor="price" className="form-label">Цена, сом</label>
                <input id="price" name="price" type="number" min="0" step="any" className="form-control" required />
              </div>
              <div className="mb-3">
                <label htmlFor="image" className="form-label">Изображение</label>
                <input id="image" name="image" type="file" accept="image/*" className="form-control" required />
              </div>
              <button type="submit" className="btn btn-primary">
                {sending ? 'Отправка…' : 'Добавить'}
              </button>
            </fieldset>
          </form>
          {formError && <p className="alert alert-danger mt-3 mb-0" role="alert">{formError}</p>}
          {message && <p className="alert alert-success mt-3 mb-0" role="status">{message}</p>}
        </div>
      </section>

      <section>
        <div className="d-flex align-items-center gap-3 mb-3">
          <h2 className="h4 mb-0">Все объявления</h2>
          <button className="btn btn-outline-secondary btn-sm" onClick={loadAds} disabled={loading || sending}>
            Обновить
          </button>
        </div>
        {loading && <p role="status">Загрузка…</p>}
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {!loading && !error && ads.length === 0 && <p>Пока нет объявлений.</p>}

        <div className="row g-3">
          {ads.map(ad => (
            <div className="col-12 col-md-6 col-lg-4" key={ad.id}>
              <article className="card h-100">
                {ad.image_url && (
                  <img
                    src={new URL(ad.image_url, apiUrl).href}
                    alt={ad.title}
                    className="card-img-top object-fit-cover"
                    height={220}
                    loading="lazy"
                  />
                )}
                <div className="card-body text-break">
                  <h3 className="h5">{ad.title}</h3>
                  <p className="card-text">{ad.description}</p>
                  <p className="fw-bold mb-0">{ad.price.toLocaleString('ru-RU')} сом</p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
