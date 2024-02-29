// React kütüphanesini projeye ekliyoruz.
import React from "react";
// web3 ve lottery isimli dosyaları projemize ekliyoruz.
import web3 from "./web3";
import lottery from "./lottery";

// React sınıf bileşeni olan App bileşenini oluşturuyoruz.
class App extends React.Component {
  // Bileşenin başlangıç durumu (state) tanımlanıyor.
  state = {
    manager: "",    // Lottery kontratını yöneten kişinin adresi
    players: [],    // Lotereye katılan oyuncuların adresleri
    balance: "",    // Lotere kontratının bakiyesi
    value: "",      // Katılım için girilen ether miktarı
    message: "",    // Kullanıcıya gösterilecek mesaj
  };

  // Bileşenin monte edildiği (componentDidMount) yaşam döngüsü olayı.
  async componentDidMount() {
    // Lottery kontratının yöneticisinin adresini çekiyoruz.
    const manager = await lottery.methods.manager().call();
    // Lottery kontratına katılan oyuncuların adreslerini çekiyoruz.
    const players = await lottery.methods.getPlayers().call();
    // Lottery kontratının bakiyesini çekiyoruz.
    const balance = await web3.eth.getBalance(lottery.options.address);

    // State'i güncelliyoruz.
    this.setState({ manager, players, balance });
  }

  // Form gönderildiğinde çağrılan fonksiyon.
  onSubmit = async (event) => {
    // Sayfanın yeniden yüklenmesini engelliyoruz.
    event.preventDefault();

    // Kullanıcının hesaplarını çekiyoruz.
    const accounts = await web3.eth.getAccounts();

    // Kullanıcıya işlem başarılı olana kadar bekleme mesajını gösteriyoruz.
    this.setState({ message: "Waiting on transaction success..." });

    // Lottery kontratına katılım işlemini gerçekleştiriyoruz.
    await lottery.methods.enter().send({
      from: accounts[0],  // İşlemi yapan kullanıcının adresi
      value: web3.utils.toWei(this.state.value, "ether"),  // Girilen ether miktarı
    });

    // Kullanıcıya katılımın gerçekleştiğine dair mesajı gösteriyoruz.
    this.setState({ message: "You have been entered!" });
  };

  // "Pick a winner!" butonuna tıklandığında çağrılan fonksiyon.
  onClick = async () => {
    // Kullanıcının hesaplarını çekiyoruz.
    const accounts = await web3.eth.getAccounts();

    // Kullanıcıya işlem başarılı olana kadar bekleme mesajını gösteriyoruz.
    this.setState({ message: "Waiting on transaction success..." });

    // Lottery kontratında kazananı belirleme işlemini gerçekleştiriyoruz.
    await lottery.methods.pickWinner().send({
      from: accounts[0],  // İşlemi yapan kullanıcının adresi
    });

    // Kullanıcıya kazananın belirlendiğine dair mesajı gösteriyoruz.
    this.setState({ message: "A winner has been picked!" });
  };

  // Bileşenin render metodu, kullanıcı arayüzünü oluşturur.
  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>
          This contract is managed by {this.state.manager}. There are currently{" "}
          {this.state.players.length} people entered, competing to win{" "}
          {web3.utils.fromWei(this.state.balance, "ether")} ether!
        </p>

        <hr />

        {/* Katılım formunu oluşturan bölüm */}
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input
              value={this.state.value}
              onChange={(event) => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>

        <hr />

        {/* Kazanan belirleme butonunu oluşturan bölüm */}
        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>

        <hr />

        {/* Kullanıcıya gösterilecek mesaj */}
        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

// Bileşeni dışa aktarıyoruz.
export default App;
