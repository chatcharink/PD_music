class CreateMusicalInstruments < ActiveRecord::Migration[7.0]
  def change
    create_table :musical_instruments do |t|
      t.string :musical_instruments_th, limit: 150
      t.string :musical_instruments_en, limit: 150
      t.text :description
      t.column :status, "ENUM('active', 'deleted') DEFAULT 'active'"
      t.timestamps
    end
  end
end
