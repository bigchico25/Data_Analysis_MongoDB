from flask import Flask, render_template, request
import pandas as pd

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/', methods=['POST'])
def home_post():
    # Lê o arquivo JSON e cria um DataFrame
    df = pd.read_json(r'C:\Users\eduar\Desktop\Brendi_Project\python\conversations.json')

    # Extrai a data da coluna "receivedTimestamp"
    df['Data'] = pd.to_datetime(df['receivedTimestamp'].apply(lambda x: x['$date'][:10]))

    # Lê as datas digitadas pelo usuário
    data_inicial = request.form['data_inicial']
    data_final = request.form['data_final']

    # Verifica se a data inicial é "hoje"
    if data_inicial.lower() == 'hoje':
        data_inicial = pd.Timestamp.now().floor('D')
    else:
        data_inicial = pd.to_datetime(data_inicial)

    # Verifica se a data final é "hoje"
    if data_final.lower() == 'hoje':
        data_final = pd.Timestamp.now().floor('D')
    else:
        data_final = pd.to_datetime(data_final)

    # Filtra as conversas pela data inicial e final
    filtro = df[(df['Data'] >= data_inicial) & (df['Data'] <= data_final)]

    # Agrupa as conversas por restaurante e conta a quantidade de conversas
    pivot_table = pd.pivot_table(filtro, values='storeMenuSlug', index='Data', columns='storeMenuSlug', aggfunc=len, fill_value=0)
    pivot_table.columns.name = None

    # Calcula o total de conversas
    total = pivot_table.sum()

    # Formata a tabela
    styled_table = total.to_frame().style \
        .background_gradient(cmap='Blues', low=.5, high=0).highlight_max(color='green') \
        .set_caption(f'Quantidade total de conversas entre {data_inicial.strftime("%d/%m/%Y")} e {data_final.strftime("%d/%m/%Y")}') \
        .set_properties(**{'text-align': 'center'})

    # Renderiza o template HTML com a tabela formatada
    return render_template('home.html', table=styled_table.render())

if __name__ == '__main__':
    app.run(debug=True)
