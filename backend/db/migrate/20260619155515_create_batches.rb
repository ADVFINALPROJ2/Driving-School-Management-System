class CreateBatches < ActiveRecord::Migration[8.1]
  def change
    create_table :batches do |t|
      t.string :name, null: false
      t.string :status, default: 'pending'
      t.datetime :submitted_at
      t.datetime :approved_at
      t.text :rejection_reason

      t.timestamps
    end
    add_index :batches, :name, unique: true
  end
end
