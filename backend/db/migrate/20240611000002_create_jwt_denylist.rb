# frozen_string_literal: true

class CreateJwtDenylist < ActiveRecord::Migration[8.0]
  def change
    create_table :jwt_denylist, id: :uuid do |t|
      t.string :jti, null: false
      t.datetime :exp, null: false

      t.timestamps null: false
    end

    add_index :jwt_denylist, :jti, unique: true
    add_index :jwt_denylist, :exp
  end
end
